import { useQuery } from '@tanstack/react-query'

import { getHistory } from '@/server'
import { historyKeys } from './api'

export function useHistory() {
  return useQuery({
    queryKey: historyKeys.list(),
    queryFn: () => getHistory(),
  })
}
