import { createPool, sql, DatabasePool } from 'slonik'

let pool: DatabasePool | undefined

export const initializeDatabase = async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  pool = await createPool(databaseUrl)

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

export const closeDatabase = async () => {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}
