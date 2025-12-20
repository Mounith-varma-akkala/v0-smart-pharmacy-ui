// This file is kept for compatibility but not used since we're using Supabase
// If you need MySQL integration in the future, uncomment and configure below

/*
import mysql from 'mysql2/promise'

// MySQL connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'pharmacy_sales',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  // Add these for better connection handling
  reconnect: true,
  idleTimeout: 300000,
  // Handle SSL issues
  ssl: false
}

// Create connection pool for better performance
let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery(query: string, params: any[] = []) {
  let connection = null
  try {
    // Log the query for debugging (remove in production)
    console.log('Executing query:', query.substring(0, 100) + '...')
    console.log('With params:', params)
    
    const pool = getPool()
    const [results] = await pool.execute(query, params)
    
    console.log('Query executed successfully, rows:', Array.isArray(results) ? results.length : 'N/A')
    return results
  } catch (error) {
    console.error('MySQL Query Error:', error)
    console.error('Query was:', query)
    console.error('Params were:', params)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to MySQL server. Please check if MySQL is running and the connection details are correct.')
      } else if (error.message.includes('Access denied')) {
        throw new Error('MySQL access denied. Please check your username and password.')
      } else if (error.message.includes('Unknown database')) {
        throw new Error(`Database '${dbConfig.database}' does not exist. Please create it first.`)
      } else if (error.message.includes("Table") && error.message.includes("doesn't exist")) {
        throw new Error('Sales table does not exist. Please check your database structure.')
      }
    }
    
    throw error
  }
}

export async function getConnection() {
  try {
    const pool = getPool()
    return await pool.getConnection()
  } catch (error) {
    console.error('Failed to get MySQL connection:', error)
    throw error
  }
}

// Test connection function
export async function testConnection() {
  try {
    const result = await executeQuery('SELECT 1 as test, NOW() as current_time')
    return { success: true, result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error' 
    }
  }
}

export default getPool
*/

// Placeholder functions for compatibility
export async function executeQuery(query: string, params: any[] = []) {
  throw new Error('MySQL is not configured. This app uses Supabase for data storage.')
}

export async function getConnection() {
  throw new Error('MySQL is not configured. This app uses Supabase for data storage.')
}

export async function testConnection() {
  return { 
    success: false, 
    error: 'MySQL is not configured. This app uses Supabase for data storage.' 
  }
}

export default null