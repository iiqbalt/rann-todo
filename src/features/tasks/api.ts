import type { TaskStatus } from '@/db/schema'

export type TaskListFilters = {
  workspaceId?: string | null
  status?: TaskStatus
}

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: TaskListFilters) =>
    [...taskKeys.lists(), filters ?? {}] as const,
}
