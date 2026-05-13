CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate >= 0),
  contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  hourly_rate_snapshot INTEGER NOT NULL CHECK (hourly_rate_snapshot >= 0),
  charge_mode TEXT NOT NULL CHECK (charge_mode IN ('auto', 'manual')),
  manual_amount INTEGER CHECK (manual_amount >= 0),
  amount_charged INTEGER NOT NULL CHECK (amount_charged >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount_paid INTEGER NOT NULL CHECK (amount_paid > 0),
  method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
