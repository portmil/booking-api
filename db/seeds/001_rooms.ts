import type { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  await knex('rooms')
    .insert([
      { name: 'Conference Room A' },
      { name: 'Conference Room B' },
      { name: 'Meeting Pod 1' },
    ])
    .onConflict('name')
    .ignore()
}
