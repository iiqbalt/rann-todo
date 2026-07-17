import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'

const inputSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS']).optional(),
})

/**
 * Fetch active dashboard tasks (TODO + IN_PROGRESS).
 *
 * Intentionally does NOT run auto-archive as a side-effect.
 * Archive is handled separately so the first paint is not blocked by a write.
 */
export const getTasks = createServerFn({ method: 'GET' })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const userId = await getCurrentUserId()

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
