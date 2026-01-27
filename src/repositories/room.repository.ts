import { sql } from 'slonik'
import { getPool } from '../database'

export class RoomRepository {
  async roomExists(roomId: number): Promise<boolean> {
    const pool = getPool()
    const result = (await pool.query(
      (sql as any)`SELECT id FROM rooms WHERE id = ${roomId}`,
    )) as unknown as { rows: Array<{ id: number }> }
    return result.rows.length > 0
  }
}
