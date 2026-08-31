import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq, inArray, isNull } from 'drizzle-orm'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import type { Task } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'

export type HistoryGroup = {
  date: string
  tasks: Task[]
}

const historySchema = z.object({
  workspaceId: z.string().uuid().nullable().optional(),
})

function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const getHistory = createServerFn({ method: 'GET' })
  .inputValidator(historySchema)
  .handler(async ({ data }): Promise<HistoryGroup[]> => {
    const userId = await getCurrentUserId()
    const workspaceId = data.workspaceId ?? null

    const workspaceClause =
      workspaceId === null
        ? isNull(tasks.workspaceId)
        : eq(tasks.workspaceId, workspaceId)

    const rows = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          workspaceClause,
          inArray(tasks.status, ['COMPLETED', 'ARCHIVED']),
        ),
      )
      .orderBy(desc(tasks.completedAt))

    const groups = new Map<string, HistoryGroup>()
    for (const task of rows) {
      if (!task.completedAt) continue
      const dateKey = formatDateKey(task.completedAt)
      const group = groups.get(dateKey) ?? { date: dateKey, tasks: [] }
      group.tasks.push(task)
      groups.set(dateKey, group)
    }

    return Array.from(groups.values())
  })
