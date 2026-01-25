# Meeting Room Booking API

A minimal REST API for booking meeting rooms built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- **Book a room** for a specific time period
- **Delete bookings** with validation
- **List all bookings** for a specific room
- Automatic overlap detection to prevent double-bookings
- Past booking prevention
- Database constraints and validation

## Tech Stack

- **Runtime**: Node.js v24.13.0
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 (via Docker)
- **Database Client**: Slonik

## Project Structure

```
booking-api/
├── src/
│   ├── index.ts           # Application entry point
│   ├── app.ts             # Express app setup
│   ├── database.ts        # Database connection management
│   ├── types.ts           # TypeScript type definitions
│   └── routes/
│       └── bookings.ts    # Booking endpoints
├── docker-compose.yml      # PostgreSQL container config
├── init.sql               # Database schema and seed data
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## Setup Instructions

### Prerequisites

- Node.js v24.13.0 or later
- Docker and Docker Compose
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update if needed:

```bash
cp .env.example .env
```

The `.env` file should contain:
```
DATABASE_URL=postgresql://booking_user:booking_password@localhost:5432/booking_db
PORT=3000
NODE_ENV=development
```

### 3. Start PostgreSQL

Start the PostgreSQL database with Docker Compose:

```bash
docker-compose up -d
```

This will:
- Create a PostgreSQL container
- Initialize the database schema
- Seed sample rooms (Conference Room A, B, Meeting Pod 1, Board Room)
- Create indexes for efficient queries

Verify the database is healthy:
```bash
docker-compose ps
```

### 4. Run the Application

For development (with ts-node):
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /health
```

Returns `{ "status": "ok" }` if the server is running.

### Create a Booking

```
POST /bookings
Content-Type: application/json

{
  "room_id": 1,
  "start_time": "2026-02-15T10:00:00Z",
  "end_time": "2026-02-15T11:00:00Z",
  "title": "Team Standup",
  "attendees": 5
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "room_id": 1,
  "start_time": "2026-02-15T10:00:00.000Z",
  "end_time": "2026-02-15T11:00:00.000Z",
  "title": "Team Standup",
  "attendees": 5,
  "created_at": "2026-01-23T12:34:56.789Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields or invalid time range
- `404 Not Found`: Room doesn't exist
- `409 Conflict`: Booking overlaps with existing booking

### List Bookings for a Room

```
GET /rooms/{room_id}/bookings
```

Returns an array of bookings for the specified room, sorted by start time.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "room_id": 1,
    "start_time": "2026-02-15T10:00:00.000Z",
    "end_time": "2026-02-15T11:00:00.000Z",
    "title": "Team Standup",
    "attendees": 5,
    "created_at": "2026-01-23T12:34:56.789Z"
  }
]
```

### Delete a Booking

```
DELETE /bookings/{id}
```

Deletes the booking with the specified ID.

**Response (204 No Content):** Empty response on success

**Error Responses:**
- `404 Not Found`: Booking doesn't exist

## Validation Rules

1. **Time constraints**: Start time must be before end time
2. **Future bookings only**: Start time must be after the current time
3. **No overlaps**: A booking cannot overlap with existing bookings for the same room
4. **Room must exist**: Can only book rooms that exist in the database

## Design Decisions

### Database Constraints
- Used PostgreSQL constraints (`CHECK`) for `start_time < end_time` and `start_time >= CURRENT_TIMESTAMP`
- This provides database-level protection against invalid data, even if the application layer is bypassed

### Overlap Detection
- Overlaps are detected using the interval logic: `new_start < existing_end AND new_end > existing_start`
- This handles all overlap cases including contained and partially overlapping intervals
- The check is performed before insertion to prevent constraint violations

### Indexes
- Created indexes on `bookings(room_id)` and `bookings(room_id, start_time, end_time)` for efficient queries
- The composite index speeds up both the overlap check and listing bookings by room

### Timezone Handling
- All timestamps are stored and transmitted in UTC (ISO 8601 format)
- Database stores timestamps with timezone awareness
- Time validation uses JavaScript Date objects which interpret input as UTC

### Error Handling
- Comprehensive error responses with descriptive messages
- Distinguishes between client errors (4xx) and server errors (5xx)
- Includes optional `details` field for debugging

### Connection Management
- Graceful shutdown handlers (SIGTERM/SIGINT) properly close the database pool
- Connection pooling managed by Slonik for efficiency

## Development

### Build TypeScript

```bash
npm run build
```

### Clean Build Artifacts

```bash
npm run clean
```

### Stop PostgreSQL

```bash
docker-compose down
```

To also remove the database volume:
```bash
docker-compose down -v
```

## Assumptions

- Rooms are pre-populated and don't require management
- Time periods use ISO 8601 format with UTC timezone
- All bookings must be in the future (cannot book retroactively)
- Booking duration is determined by start and end timestamps, not a separate duration field
- The `attendees` field is optional

## Limitations

- No authentication/authorization (assumed trusted internal use)
- No rate limiting (can be added via middleware like `express-rate-limit`)
- No booking modification (only create and delete supported)
- No search/filtering by date range or other criteria
- Single-instance deployment (no horizontal scaling considerations)
- No soft deletes; deletions are permanent

## Example Usage

```bash
# Create a booking
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "start_time": "2026-02-15T14:00:00Z",
    "end_time": "2026-02-15T15:00:00Z",
    "title": "Project Review",
    "attendees": 8
  }'

# List bookings for room 1
curl http://localhost:3000/rooms/1/bookings

# Delete booking 1
curl -X DELETE http://localhost:3000/bookings/1
```

## License

MIT
