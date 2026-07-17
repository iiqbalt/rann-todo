import { pgEnum } from 'drizzle-orm/pg-core'

export const taskStatusEnum = pgEnum('task_status', [
  'TODO',
  'IN_PROGRESS',
  'COMPLETED',
  'ARCHIVED',
])

export type TaskStatus = (typeof taskStatusEnum.enumValues)[number]
