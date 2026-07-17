import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync } from 'node:fs'
import dns from 'node:dns/promises'
import { Pool } from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const parsed = new URL(url)
const originalHost = parsed.hostname
const port = Number(parsed.port || 5432)
const user = decodeURIComponent(parsed.username)
const password = decodeURIComponent(parsed.password)
const database = parsed.pathname.slice(1) || 'postgres'

// Resolve hostname via c-ares first (more reliable than Node's default resolver
// in some networks). Fallback to a hardcoded IP if DNS fails entirely.
async function resolveHost(host: string): Promise<string> {
  try {
    const ips = await dns.resolve4(host)
    if (ips.length > 0) {
      console.log(`DNS resolved ${host} -> ${ips[0]}`)
      return ips[0]
    }
  } catch (err) {
    console.warn(`DNS resolve failed for ${host}: ${(err as Error).message}`)
  }
  // Fallback IP — known good for ap-southeast-1 pooler
  console.warn(`Falling back to hardcoded IP 54.255.219.82`)
  return '54.255.219.82'
}

const resolvedHost = await resolveHost(originalHost)

// Use the IP for TCP + the original hostname for SNI/cert verification
const pool = new Pool({
  host: resolvedHost,
  port,
  user,
  password,
  database,
  ssl: {
    rejectUnauthorized: false,
    servername: originalHost,
  },
  connectionTimeoutMillis: 15000,
})

const sqlPath = new URL('../src/db/migrations/0000_yellow_preak.sql', import.meta.url)
const sql = readFileSync(sqlPath, 'utf8')
const statements = sql
  .split('--> statement-breakpoint')
  .map((s) => s.trim())
  .filter(Boolean)

try {
  await pool.query('SELECT 1')
  console.log('✓ Connection OK\n')

  for (const [i, stmt] of statements.entries()) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 70)
    try {
      await pool.query(stmt)
      console.log(`[${i + 1}/${statements.length}] OK: ${preview}...`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[${i + 1}/${statements.length}] FAIL: ${msg}`)
      console.error(`  >> ${preview}`)
    }
  }

  const tables = await pool.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  )
  const enums = await pool.query<{ typname: string }>(
    `SELECT typname FROM pg_type
     WHERE typtype = 'e' AND typname NOT LIKE 'pg_%' ORDER BY typname`,
  )
  const indexes = await pool.query<{ indexname: string; tablename: string }>(
    `SELECT indexname, tablename FROM pg_indexes
     WHERE schemaname = 'public' ORDER BY tablename, indexname`,
  )

  console.log('\n=== Tables ===')
  for (const r of tables.rows) console.log(' -', r.table_name)
  console.log('\n=== Enums ===')
  for (const r of enums.rows) console.log(' -', r.typname)
  console.log('\n=== Indexes ===')
  for (const r of indexes.rows) console.log(` - ${r.indexname} on ${r.tablename}`)
} finally {
  await pool.end()
}
