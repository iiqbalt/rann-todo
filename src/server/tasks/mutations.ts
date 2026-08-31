import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq, isNull, sql } from 'drizzle-orm'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  workspaceId: z.string().uuid().nullable().optional(),
})

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

const deleteSchema = z.object({
  id: z.string().uuid(),
})

export const createTask = createServerFn({ method: 'POST' })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const userId = await getCurrentUserId()
    const workspaceId = data.workspaceId ?? null

    const workspaceClause =
      workspaceId === null
        ? isNull(tasks.workspaceId)
        : eq(tasks.workspaceId, workspaceId)

    const [{ max }] = await db
      .select({ max: sql<number>`MAX(${tasks.position})` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          workspaceClause,
          eq(tasks.status, 'TODO'),
        ),
      )

    const position = (max ?? -1) + 1

    const [created] = await db
      .insert(tasks)
      .values({
        userId,
        workspaceId,
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: 'TODO',
        position,
      })
      .returning()

    return created
  })

export const updateTask = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data }) => {
    const userId = await getCurrentUserId()
    const { id, ...updates } = data

    const setValues: Record<string, unknown> = {}
    if (updates.title !== undefined) setValues.title = updates.title
    if (updates.description !== undefined) {
      setValues.description = updates.description
    }
    if (updates.dueDate !== undefined) {
      setValues.dueDate = updates.dueDate ? new Date(updates.dueDate) : null
    }
    if (Object.keys(setValues).length === 0) {
      throw new Error('No fields to update')
    }

    const [updated] = await db
      .update(tasks)
      .set(setValues)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning()

    if (!updated) {
      throw new Error('Task not found')
    }

    return updated
  })

export const deleteTask = createServerFn({ method: 'POST' })
  .inputValidator(deleteSchema)
  .handler(async ({ data }) => {
    const userId = await getCurrentUserId()

    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, data.id), eq(tasks.userId, userId)))
      .returning()

    if (!deleted) {
      throw new Error('Task not found')
    }

    return { id: data.id }
  })
