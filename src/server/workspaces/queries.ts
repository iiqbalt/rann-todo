import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { workspaces } from '@/db/schema'
import type { Workspace } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'

export const getWorkspaces = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Workspace[]> => {
    const userId = await getCurrentUserId()

    return db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .orderBy(asc(workspaces.createdAt))
  },
)
