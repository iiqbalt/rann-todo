import { createServerFn } from '@tanstack/react-start'
import { and, eq, lt } from 'drizzle-orm'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { getCurrentUserId } from '@/server/auth'

/**
 * Auto-archive logic — PRD step 10
 *
 * Rule: every time Dashboard loads:
 *   IF completed_at < today (start-of-day, local time)
 *   THEN status = 'ARCHIVED', archived_at = NOW()
 *
 * Invariants:
 *  - Idempotent: running twice is safe. Rows already in ARCHIVED status are
 *    filtered out by the WHERE clause, so subsequent runs touch 0 rows.
 *  - Never deletes: tasks are UPDATEd, never DELETEd.
 *  - Hidden from Dashboard: getTasks() filters `status != 'ARCHIVED'`.
 *  - Visible in History: getHistory() includes both COMPLETED and ARCHIVED.
 *  - Per-user: scoped to userId from getCurrentUserId().
 *
 * Trigger path (default, every Dashboard load):
 *  DashboardPage mounts → useTasks() fires → getTasks() server fn
 *    → archiveExpiredTasksInternal() runs as side-effect before returning tasks.
 *
 * Backup trigger: DashboardPage also explicitly calls `useArchiveExpiredTasks`.
 * mutate() on mount so archive runs even if useTasks returns cached data.
 *
 * Manual trigger: useArchiveExpiredTasks() hook (cron / admin tools).
 */

/**
 * Returns 00:00:00 local time of today. Tasks completed strictly before this
 * instant are eligible for archiving.
 */
function startOfToday(): Date {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
}

/**
 * Internal helper. Archives COMPLETED tasks whose completion precedes today's
 * start-of-day for the given user. Returns the number of rows archived.
 */
export async function archiveExpiredTasksInternal({
    userId,
}: {
    userId: string
}): Promise<number> {
    const result = await db
        .update(tasks)
        .set({ status: 'ARCHIVED', archivedAt: new Date() })
        .where(
            and(
                eq(tasks.userId, userId),
                eq(tasks.status, 'COMPLETED'),
                lt(tasks.completedAt, startOfToday()),
            ),
        )
        .returning({ id: tasks.id })

    return result.length
}

/**
 * Public server function — manual/explicit archive trigger.
 * (e.g. cron job, admin tool, or Dashboard mount safety-net call).
 */
export const archiveExpiredTasks = createServerFn({ method: 'POST' }).handler(
    async () => {
        const userId = await getCurrentUserId()
        const archived = await archiveExpiredTasksInternal({ userId })
        return { archived }
    },
)
