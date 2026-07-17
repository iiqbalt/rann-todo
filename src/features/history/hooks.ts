import { useQuery } from '@tanstack/react-query'

import { getHistory } from '@/server'
import { historyKeys } from './api'

const HISTORY_STALE_TIME_MS = 60_000

export function useHistory() {
  return useQuery({
    queryKey: historyKeys.list(),
    queryFn: () => getHistory(),
    staleTime: HISTORY_STALE_TIME_MS,
  })
}
