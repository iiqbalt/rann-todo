import dns from 'node:dns'

// Workaround: some networks / ISPs return ENOTFOUND for the Supabase pooler
// hostname via the system resolver. Force Node's resolver to use public DNS
// (Cloudflare + Google) so db connections can resolve the hostname.
// Idempotent if called multiple times during module evaluation.
dns.setServers(['1.1.1.1', '8.8.8.8'])

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

export const db = drizzle(pool, { schema })
