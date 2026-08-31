import { useQuery } from '@tanstack/react-query'

import { getHistory } from '@/server'
import { historyKeys } from './api'

const HISTORY_STALE_TIME_MS = 60_000

export function useHistory(workspaceId: string | null) {
  return useQuery({
    queryKey: historyKeys.list({ workspaceId }),
    queryFn: () => getHistory({ data: { workspaceId } }),
    staleTime: HISTORY_STALE_TIME_MS,
  })
}
