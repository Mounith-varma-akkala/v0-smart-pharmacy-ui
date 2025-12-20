import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/mysql/client'

export async function GET() {
  try {
    const connectionTest = await testConnection()
    
    if (connectionTest.success) {
      return NextResponse.json({
        success: true,
        message: 'MySQL connection successful',
        data: connectionTest.result,
        timestamp: new Date().toISOString(),
        config: {
          host: process.env.MYSQL_HOST,
          port: process.env.MYSQL_PORT,
          database: process.env.MYSQL_DATABASE,
          user: process.env.MYSQL_USER
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: connectionTest.error,
        message: 'MySQL connection failed',
        config: {
          host: process.env.MYSQL_HOST,
          port: process.env.MYSQL_PORT,
          database: process.env.MYSQL_DATABASE,
          user: process.env.MYSQL_USER
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('MySQL connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'MySQL connection test failed'
    }, { status: 500 })
  }
}