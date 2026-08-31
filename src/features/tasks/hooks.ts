import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { Task } from '@/db/schema'

import {
  archiveExpiredTasks as archiveExpiredTasksFn,
  completeTask as completeTaskFn,
  createTask as createTaskFn,
  deleteTask as deleteTaskFn,
  getTasks,
  moveTask as moveTaskFn,
  updateTask as updateTaskFn,
  updateTaskPositions as updateTaskPositionsFn,
} from '@/server'
import { historyKeys } from '@/features/history/api'
import { taskKeys } from './api'

type TaskStatusFilter = 'TODO' | 'IN_PROGRESS'

const TASKS_STALE_TIME_MS = 30_000

export type UpdateTaskVariables = {
  id: string
  title?: string
  description?: string | null
  dueDate?: string | null
}

export type MoveTaskVariables = {
  id: string
  targetStatus: TaskStatusFilter
  targetPosition?: number
  workspaceId: string | null
}

export type ReorderTasksVariables = {
  items: Array<{
    id: string
    position: number
    status: TaskStatusFilter
    workspaceId: string | null
  }>
}

function snapshotTasks(
  qc: QueryClient,
): Array<[readonly unknown[], Task[] | undefined]> {
  return qc.getQueriesData<Task[]>({ queryKey: taskKeys.lists() })
}

function patchTasks(qc: QueryClient, patch: (tasks: Task[]) => Task[]): void {
  qc.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (old) =>
    old ? patch(old) : old,
  )
}

function rollback(
  qc: QueryClient,
  previous: Array<[readonly unknown[], Task[] | undefined]>,
): void {
  for (const [key, data] of previous) {
    qc.setQueryData(key, data)
  }
}

/**
 * Single dashboard query for the current workspace (TODO + IN_PROGRESS).
 * Prefer this over calling useTasks twice — halves network roundtrips.
 */
export function useDashboardTasks(workspaceId: string | null) {
  return useQuery({
    queryKey: taskKeys.list({ workspaceId }),
    queryFn: () => getTasks({ data: { workspaceId } }),
    staleTime: TASKS_STALE_TIME_MS,
  })
}

export function useTasks(
  workspaceId: string | null,
  status?: TaskStatusFilter,
) {
  return useQuery({
    queryKey: taskKeys.list({ workspaceId, status }),
    queryFn: () => getTasks({ data: { workspaceId, status } }),
    staleTime: TASKS_STALE_TIME_MS,
  })
}

/**
 * Fire-and-forget archive on mount. Only invalidates caches if rows changed,
 * so a no-op archive does not force an extra dashboard refetch.
 */
export function useArchiveOnMount(workspaceId: string | null) {
  const archive = useArchiveExpiredTasks(workspaceId)
  const didRun = useRef<string | null | boolean>(null)

  useEffect(() => {
    if (didRun.current === workspaceId) return
    didRun.current = workspaceId
    archive.mutate({ workspaceId })
  }, [archive, workspaceId])
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      title: string
      description?: string
      dueDate?: string
      workspaceId: string | null
    }) => createTaskFn({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: UpdateTaskVariables) =>
      updateTaskFn({ data: variables }),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = snapshotTasks(qc)

      const { id, ...rest } = variables
      const patch: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined) patch[key] = value
      }

      if (Object.keys(patch).length > 0) {
        patchTasks(qc, (old) =>
          old.map((task) => (task.id === id ? { ...task, ...patch } : task)),
        )
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) rollback(qc, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string }) =>
      deleteTaskFn({ data: variables }),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = snapshotTasks(qc)

      patchTasks(qc, (old) => old.filter((task) => task.id !== variables.id))

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) rollback(qc, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useMoveTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: MoveTaskVariables) =>
      moveTaskFn({ data: variables }),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = snapshotTasks(qc)

      patchTasks(qc, (old) =>
        old.map((task) =>
          task.id === variables.id
            ? {
                ...task,
                status: variables.targetStatus,
                ...(variables.targetPosition !== undefined
                  ? { position: variables.targetPosition }
                  : {}),
              }
            : task,
        ),
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) rollback(qc, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useReorderTasks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: ReorderTasksVariables) =>
      updateTaskPositionsFn({ data: variables }),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = snapshotTasks(qc)

      const positionMap = new Map(
        variables.items.map((item) => [item.id, item]),
      )

      patchTasks(qc, (old) =>
        old.map((task) => {
          const update = positionMap.get(task.id)
          if (!update) return task
          return {
            ...task,
            position: update.position,
            status: update.status,
          }
        }),
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) rollback(qc, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string }) =>
      completeTaskFn({ data: variables }),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = snapshotTasks(qc)

      patchTasks(qc, (old) => old.filter((task) => task.id !== variables.id))

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) rollback(qc, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.invalidateQueries({ queryKey: historyKeys.lists() })
    },
  })
}

export function useArchiveExpiredTasks(workspaceId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { workspaceId: string | null }) =>
      archiveExpiredTasksFn({ data: { workspaceId: input.workspaceId } }),
    onSuccess: (data) => {
      // Only refetch if something actually changed — avoids extra dashboard
      // roundtrip when archive is a no-op (most page loads).
      if (data.archived > 0) {
        qc.invalidateQueries({ queryKey: taskKeys.lists() })
        qc.invalidateQueries({ queryKey: historyKeys.lists() })
      }
    },
  })
}
