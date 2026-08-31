import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'

import { users } from './users'
import { workspaces } from './workspaces'
import { taskStatusEnum } from './enums'

export const tasks = pgTable(
  'tasks',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, {
      onDelete: 'set null',
    }),
    title: text().notNull(),
    description: text(),
    status: taskStatusEnum('status').notNull().default('TODO'),
    position: integer().notNull().default(0),
    dueDate: timestamp('due_date'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    archivedAt: timestamp('archived_at'),
    estimatedMinutes: integer('estimated_minutes'),
    focusCount: integer('focus_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('tasks_user_status_position_idx').on(
      table.userId,
      table.status,
      table.position,
    ),
    index('tasks_user_completed_at_idx').on(table.userId, table.completedAt),
    index('tasks_workspace_status_position_idx').on(
      table.workspaceId,
      table.status,
      table.position,
    ),
    index('tasks_workspace_completed_at_idx').on(
      table.workspaceId,
      table.completedAt,
    ),
  ],
)

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
