import type { TaskStatus } from '@/db/schema'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: { status?: TaskStatus }) =>
    [...taskKeys.lists(), filters ?? {}] as const,
}
