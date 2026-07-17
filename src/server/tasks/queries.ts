import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'
import { archiveExpiredTasksInternal } from '@/server/tasks/archive'

const inputSchema = z.object({
    status: z.enum(['TODO', 'IN_PROGRESS']).optional(),
})

export const getTasks = createServerFn({ method: 'GET' })
    .inputValidator(inputSchema)
    .handler(async ({ data }) => {
        const userId = await getCurrentUserId()

        await archiveExpiredTasksInternal({ userId })

        const conditions = [
            eq(tasks.userId, userId),
            inArray(tasks.status, ['TODO', 'IN_PROGRESS']),
        ]
        if (data.status) {
            conditions.push(eq(tasks.status, data.status))
        }

        return db
            .select()
            .from(tasks)
            .where(and(...conditions))
            .orderBy(asc(tasks.position))
    })
