CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT start_before_end CHECK (start_time < end_time)
);

CREATE INDEX idx_bookings_time_range ON bookings(room_id, start_time, end_time);

INSERT INTO rooms (name) VALUES
  ('Conference Room A'),
  ('Conference Room B'),
  ('Meeting Pod 1'),