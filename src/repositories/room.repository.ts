import { getPool, sql } from '../database'

export class RoomRepository {
  async exists(roomId: number): Promise<boolean> {
    const pool = getPool()
    const result = await pool.exists(
      sql.typeAlias('void')`
        SELECT 1 
        FROM rooms 
        WHERE id = ${roomId}
      `,
    )
    return result
  }
}
