import { db } from '@/db'
import { users } from '@/db/schema'

const DEV_USER_ID = '00000000-0000-0000-0000-000000000000'
const DEV_USER_EMAIL = 'dev@local'
const DEV_USER_NAME = 'Dev User'

let ensured = false

export async function getCurrentUserId(): Promise<string> {
  if (!ensured) {
    await db
      .insert(users)
      .values({
        id: DEV_USER_ID,
        name: DEV_USER_NAME,
        email: DEV_USER_EMAIL,
      })
      .onConflictDoNothing()
    ensured = true
  }
  return DEV_USER_ID
}
