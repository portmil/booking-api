# Meeting Room Booking API

A minimal REST API for booking meeting rooms built with Node.js, TypeScript, Express, and PostgreSQL (via Docker).

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and modify if needed

```bash
cp .env.example .env
```

### 3. Start PostgreSQL via Docker

```bash
docker-compose up -d
```

### 4. Run the Application

For development:
```bash
npm run dev
```
This will:
- Run database migrations
- Seed sample rooms for easy testing (IDs 1, 2, and 3)
- Start the server in watch mode

For production:
```bash
npm run db:migrate
npm start
```
If you want to seed sample rooms for production, also run
```bash
npm run db:seed
```

The API will be available at `http://localhost:3000`

## Testing

Unit tests focus on business logic and error handling.
Database integration and E2E tests are intentionally omitted to avoid complex test setup for a simple project.

Ran the unit tests:
```bash
npm run test
```

## API Endpoints

### Health Check

```
GET /health
```
Returns `{ "status": "ok" }` if the server is running.

### Create a Booking

```
POST /rooms/{room_id}/bookings

{
  "startTime": "2026-03-22T10:00:00Z",
  "endTime": "2026-03-22T11:00:00Z"
}
```
For easy testing, use one of the seeded rooms (IDs 1, 2, and 3).
Times must be specified with minute precision (rounded to whole minutes).
In a real system, the UI would typically guide users to valid values.

### List Bookings for a Room

```
GET /rooms/{room_id}/bookings
```

Returns all bookings for the specified room, sorted by start time.

### Delete a Booking

```
DELETE /bookings/{id}
```
The API currently allows anyone to delete any booking. In a production system, there would likely be authentication/authorization to allow only the creator of a booking (and possibly admins) to delete it.
