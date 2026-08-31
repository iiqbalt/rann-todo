import type { TaskStatus } from '@/db/schema'

export type HistoryListFilters = {
  workspaceId?: string | null
}

export const historyKeys = {
  all: ['history'] as const,
  lists: () => [...historyKeys.all, 'list'] as const,
  list: (filters?: HistoryListFilters) =>
    [...historyKeys.lists(), filters ?? {}] as const,
}
