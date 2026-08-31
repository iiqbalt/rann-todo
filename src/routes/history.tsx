import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/history')({
  beforeLoad: () => {
    throw redirect({
      to: '/w/$workspaceId/history',
      params: { workspaceId: 'default' },
    })
  },
})
