import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import { tasks, type Task } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'

export type HistoryGroup = {
    date: string
    tasks: Task[]
}

function formatDateKey(date: Date): string {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

export const getHistory = createServerFn({ method: 'GET' }).handler(
    async (): Promise<HistoryGroup[]> => {
        const userId = await getCurrentUserId()

        const rows = await db
            .select()
            .from(tasks)
            .where(
                and(
                    eq(tasks.userId, userId),
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
    },
)
