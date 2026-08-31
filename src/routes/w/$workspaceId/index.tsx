import { createFileRoute, redirect } from '@tanstack/react-router'

import { DashboardPage } from '@/features/dashboard/DashboardPage'

export const Route = createFileRoute('/w/$workspaceId/')({
  beforeLoad: ({ params }) => {
    if (!params.workspaceId) {
      throw redirect({
        to: '/w/$workspaceId',
        params: { workspaceId: 'default' },
      })
    }
  },
  component: DashboardPage,
})
