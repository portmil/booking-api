import { createPool, createSqlTag } from 'slonik'
import type { DatabasePool } from 'slonik'
import { z } from 'zod'

let pool: DatabasePool | undefined

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`)
  }
  return value
}

export const getDatabaseUrl = () => {
  const DB_USER = required('DB_USER')
  const DB_PASSWORD = required('DB_PASSWORD')
  const DB_HOST = required('DB_HOST')
  const DB_PORT = required('DB_PORT')
  const DB_NAME = required('DB_NAME')
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
}

export const initializeDatabase = async () => {
  pool = await createPool(getDatabaseUrl(), {
    // Slonik parses timestamps as numbers (Unix time) by default
    // Override to disable this behaviour and return Date objects instead
    typeParsers: [
      // createTimestampTypeParser(),
      // createTimestampWithTimeZoneTypeParser(),
    ],
  })

  try {
    await pool.query(sql.unsafe`SELECT 1`)
    console.log('Database connection established')
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }

  return pool
}

export const getPool = (): DatabasePool => {
  if (!pool) {
    throw new Error(
      'Database pool not initialized. Call initializeDatabase() first.',
    )
  }
  return pool
}

export const sql = createSqlTag({
  typeAliases: {
    void: z.object({}).strict(),
  },
})

export const closeDatabase = async () => {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}
