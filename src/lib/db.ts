import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL;
    
    if (!databaseUrl) {
      console.error('DATABASE_URL is not set!');
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Initializing database pool...');
    
    pool = new Pool({
      connectionString: databaseUrl,
      // No SSL needed for private networking within Railway
      ssl: databaseUrl.includes('railway.internal') ? false : {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000,
      max: 20,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });

    console.log('Database pool initialized successfully');
  }

  return pool;
}

// Export the getter, not the pool directly
const db = {
  query: async (...args: Parameters<Pool['query']>) => {
    const pool = getPool();
    return pool.query(...args);
  }
};

export default db;