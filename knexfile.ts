import dotenv from 'dotenv'
import type { Knex } from 'knex'
import { getDatabaseUrl } from './src/database'

dotenv.config()

const config: Knex.Config = {
  client: 'pg',
  connection: getDatabaseUrl(),
  migrations: {
    directory: './db/migrations',
  },
  seeds: {
    directory: './db/seeds',
  },
}

export default config
