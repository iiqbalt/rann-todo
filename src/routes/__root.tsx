import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { AppLayout } from '../components/layout/AppLayout'
import { DarkModeProvider } from '../contexts/DarkModeContext'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'RannTodo',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-8 py-20 text-center">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted dark:text-dark-muted">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-ink dark:text-dark-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted dark:text-dark-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-brutal-sm border-2 border-ink bg-warm px-4 py-2 text-sm font-bold uppercase tracking-wider text-ink shadow-brutal-soft transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:border-dark-ink dark:bg-dark-warm dark:text-dark-ink dark:shadow-brutal-soft-dark"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <DarkModeProvider>
          <AppLayout>{children}</AppLayout>
        </DarkModeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
