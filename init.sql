CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  attendees INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT start_before_end CHECK (start_time < end_time),
  CONSTRAINT no_past_bookings CHECK (start_time >= CURRENT_TIMESTAMP)
);

-- Create an index for efficient room lookups in bookings
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_time_range ON bookings(room_id, start_time, end_time);

-- Insert some sample rooms
INSERT INTO rooms (name, capacity) VALUES
  ('Conference Room A', 8),
  ('Conference Room B', 6),
  ('Meeting Pod 1', 2),
  ('Board Room', 12);
