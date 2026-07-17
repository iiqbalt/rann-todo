import { defineConfig, type PluginOption } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Stub Node-only modules (`pg`, `drizzle-orm/node-postgres`, `server-only`)
// with empty equivalents for CLIENT bundles only.
//
// Why: `pg` is a CJS-only Node module that uses Buffer; it can never execute
// in a browser. TanStack Start should strip server-only modules from client
// bundles automatically, but as defense-in-depth we replace them with empty
// stubs so any accidental leak is harmless.
//
// IMPORTANT: We differentiate client vs SSR via `options.ssr` in the hook
// itself (NOT via `apply()`), because in `vite dev` `env.ssr` is undefined
// and `apply()` can't reliably distinguish. `options.ssr` is set per-request.
const stubNodeModulesForClient = (): PluginOption => ({
  name: 'stub-node-modules-for-client',
  enforce: 'pre',
  resolveId(source, _importer, options) {
    const ssr = (options as { ssr?: boolean } | undefined)?.ssr
    if (ssr) return null
    // NOTE: do NOT stub 'server-only' — let the original module throw on
    // client-side import. That's its whole purpose. Stubbing it to a no-op
    // breaks the protection and lets server-only files load on the client.
    if (source === 'node:dns' || source === 'dns') {
      return '\0dns-client-stub'
    }
    if (source === 'pg' || source.startsWith('pg/')) {
      return '\0pg-client-stub'
    }
    if (source === 'drizzle-orm/node-postgres') {
      return '\0drizzle-pg-client-stub'
    }
    return null
  },
  load(id, options) {
    const ssr = (options as { ssr?: boolean } | undefined)?.ssr
    if (ssr) return null
    if (id === '\0dns-client-stub') {
      return `export default { setServers() {}, getServers() { return [] } }`
    }
    if (id === '\0pg-client-stub') {
      return `
export class Pool {}
export class Client {}
export class Database {}
export class Connection {}
export const types = {
  getTypeParser: () => () => null,
  builtins: { INT8: 20, INT4: 23, FLOAT4: 700, FLOAT8: 701, BOOL: 16, TIMESTAMP: 1114, JSON: 114 },
  arrayParser: { create: () => null },
}
`
    }
    if (id === '\0drizzle-pg-client-stub') {
      return `
export function drizzle() {
  return new Proxy({}, { get: () => () => {} })
}
export default { drizzle }
`
    }
    return null
  },
})

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    stubNodeModulesForClient(),
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config