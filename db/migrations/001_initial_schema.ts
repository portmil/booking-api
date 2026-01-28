import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasRooms = await knex.schema.hasTable('rooms')
  if (!hasRooms) {
    await knex.schema.createTable('rooms', (table) => {
      table.increments('id').primary()
      table.text('name').notNullable().unique()
    })
  }

  await knex.raw(`CREATE EXTENSION IF NOT EXISTS btree_gist;`)

  const hasBookings = await knex.schema.hasTable('bookings')
  if (!hasBookings) {
    await knex.schema.createTable('bookings', (table) => {
      table.increments('id').primary()
      table
        .integer('room_id')
        .notNullable()
        .references('id')
        .inTable('rooms')
        .onDelete('CASCADE')
      table.timestamp('start_time', { useTz: true }).notNullable()
      table.timestamp('end_time', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())

      table.check('start_time < end_time', [], 'start_before_end')

      // Index for efficient queries when checking availability
      table.index(
        ['room_id', 'start_time', 'end_time'],
        'idx_bookings_time_range',
      )
    })

    await knex.raw(`
    ALTER TABLE bookings
    ADD CONSTRAINT no_overlapping_bookings
    EXCLUDE USING gist (
      room_id WITH =,
      tstzrange(start_time, end_time) WITH &&
    )
  `)
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bookings')
  await knex.schema.dropTableIfExists('rooms')
}
