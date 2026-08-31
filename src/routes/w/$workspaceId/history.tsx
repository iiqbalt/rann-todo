import { createFileRoute, redirect } from '@tanstack/react-router'

import { HistoryPage } from '@/features/history/HistoryPage'

export const Route = createFileRoute('/w/$workspaceId/history')({
  beforeLoad: ({ params }) => {
    if (!params.workspaceId) {
      throw redirect({
        to: '/w/$workspaceId/history',
        params: { workspaceId: 'default' },
      })
    }
  },
  component: HistoryPage,
})
