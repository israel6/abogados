import sql, { ConnectionPool, config as SQLConfig } from 'mssql'

let pool: ConnectionPool | null = null
let dbAvailable = false

const buildConfig = (): SQLConfig => ({
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bufete_abogados',
  authentication: { type: 'default' },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 15000,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
})

export const initializeDatabase = async (): Promise<void> => {
  const cfg = buildConfig()
  console.log(`  → Connecting to ${cfg.server}:${cfg.port} as [${cfg.user}] → db: ${cfg.database}`)
  try {
    pool = new sql.ConnectionPool(cfg)
    await pool.connect()
    dbAvailable = true
    console.log('✓ Database connection established')
  } catch (error) {
    console.error('✗ Database connection failed:', error)
    throw error
  }
}

export const isDatabaseAvailable = (): boolean => dbAvailable

export const getPool = (): ConnectionPool => {
  if (!pool) throw new Error('Database pool not initialized')
  return pool
}

export const executeQuery = async (query: string, inputs?: Record<string, any>) => {
  try {
    const request = new sql.Request(pool!)
    if (inputs) {
      for (const [key, value] of Object.entries(inputs)) {
        request.input(key, value)
      }
    }
    return await request.query(query)
  } catch (error) {
    console.error('Query execution error:', error)
    throw error
  }
}

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.close()
    pool = null
    dbAvailable = false
  }
}

export default { initializeDatabase, isDatabaseAvailable, getPool, executeQuery, closeDatabase }
