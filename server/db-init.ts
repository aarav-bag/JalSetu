import { pool } from "./db";

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS farms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'Your farm is thriving',
        esp32_api_key TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fields (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS water_qualities (
        id SERIAL PRIMARY KEY,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        ph_level TEXT NOT NULL,
        tds TEXT NOT NULL,
        temperature TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS soil_moistures (
        id SERIAL PRIMARY KEY,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        moisture_level INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weather_predictions (
        id SERIAL PRIMARY KEY,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        advice TEXT NOT NULL,
        forecast JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS irrigation_tips (
        id SERIAL PRIMARY KEY,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        tip TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Seed demo data if no users exist yet
    const { rows } = await client.query("SELECT id FROM users LIMIT 1");
    if (rows.length === 0) {
      await client.query(`
        INSERT INTO users (id, username, password, first_name, last_name, email)
        VALUES (1, 'Ramesh', 'password123', 'Ramesh', 'Kumar', 'ramesh@jalsetu.app')
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO farms (id, name, location, user_id, status)
        VALUES (1, 'Green Valley Farm', 'Karnataka', 1, 'Your farm is thriving')
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO fields (id, name, farm_id)
        VALUES
          (1, 'Field 1', 1),
          (2, 'Field 2', 1)
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO water_qualities (farm_id, ph_level, tds, temperature)
        VALUES (1, 'N/A', 'N/A', 'N/A');

        INSERT INTO soil_moistures (farm_id, field_id, moisture_level, status)
        VALUES
          (1, 1, 0, 'danger'),
          (1, 2, 0, 'danger');

        SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
        SELECT setval('farms_id_seq', (SELECT MAX(id) FROM farms));
        SELECT setval('fields_id_seq', (SELECT MAX(id) FROM fields));
      `);
      console.log("[db] Database seeded with demo farm data");
    }

    console.log("[db] Database tables ready");
  } finally {
    client.release();
  }
}
