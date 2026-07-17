import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'

const moveSchema = z.object({
    id: z.string().uuid(),
    targetStatus: z.enum(['TODO', 'IN_PROGRESS']),
    targetPosition: z.number().int().nonnegative().optional(),
})

const positionsSchema = z.object({
    items: z
        .array(
            z.object({
                id: z.string().uuid(),
                position: z.number().int().nonnegative(),
                status: z.enum(['TODO', 'IN_PROGRESS']),
            }),
        )
        .min(1)
        .max(500),
})

const completeSchema = z.object({
    id: z.string().uuid(),
})

export const moveTask = createServerFn({ method: 'POST' })
    .inputValidator(moveSchema)
    .handler(async ({ data }) => {
        const userId = await getCurrentUserId()

        let newPosition: number
        if (data.targetPosition !== undefined) {
            newPosition = data.targetPosition
        } else {
            const [{ max }] = await db
                .select({ max: sql<number>`MAX(${tasks.position})` })
                .from(tasks)
                .where(
                    and(
                        eq(tasks.userId, userId),
                        eq(tasks.status, data.targetStatus),
                    ),
                )
            newPosition = (max ?? -1) + 1
        }

        const [updated] = await db
            .update(tasks)
            .set({
                status: data.targetStatus,
                position: newPosition,
                startedAt: data.targetStatus === 'IN_PROGRESS' ? new Date() : null,
            })
            .where(and(eq(tasks.id, data.id), eq(tasks.userId, userId)))
            .returning()

        if (!updated) {
            throw new Error('Task not found')
        }

        return updated
    })

export const updateTaskPositions = createServerFn({ method: 'POST' })
    .inputValidator(positionsSchema)
    .handler(async ({ data }) => {
        const userId = await getCurrentUserId()

        await db.transaction(async (tx) => {
            for (const item of data.items) {
                await tx
                    .update(tasks)
                    .set({ position: item.position, status: item.status })
                    .where(and(eq(tasks.id, item.id), eq(tasks.userId, userId)))
            }
        })

        return { updated: data.items.length }
    })

export const completeTask = createServerFn({ method: 'POST' })
    .inputValidator(completeSchema)
    .handler(async ({ data }) => {
        const userId = await getCurrentUserId()

        const [updated] = await db
            .update(tasks)
            .set({
                status: 'COMPLETED',
                completedAt: new Date(),
            })
            .where(and(eq(tasks.id, data.id), eq(tasks.userId, userId)))
            .returning()

        if (!updated) {
            throw new Error('Task not found')
        }

        return updated
    })
