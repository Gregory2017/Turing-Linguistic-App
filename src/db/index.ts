import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

/**
 * Returns the MySQL connection pool, using lazy initialization.
 */
export function getDbPool(): mysql.Pool {
  if (!pool) {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = parseInt(process.env.DB_PORT || '3306', 10);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'turing_game';

    console.log(`[Database] Initializing MySQL pool for database: ${database} at ${host}:${port}`);

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    (pool as any).on('error', (err: any) => {
      console.error('Unexpected error on idle MySQL connection pool:', err);
    });
  }
  return pool;
}
