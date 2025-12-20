import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql/client'

export async function GET() {
  try {
    const inspection = {
      connection: false,
      database: process.env.MYSQL_DATABASE,
      tables: [],
      salesTableStructure: null,
      sampleData: null,
      error: null
    }

    // Test connection
    try {
      await executeQuery('SELECT 1')
      inspection.connection = true
    } catch (error) {
      inspection.error = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      return NextResponse.json(inspection)
    }

    // Get all tables
    try {
      const tables = await executeQuery(`
        SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ?
      `, [process.env.MYSQL_DATABASE])
      
      inspection.tables = tables
    } catch (error) {
      inspection.error = `Failed to get tables: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Check for sales-related tables
    const salesTableNames = ['sales', 'sale', 'transactions', 'orders', 'purchases']
    let salesTable = null

    for (const tableName of salesTableNames) {
      try {
        const tableCheck = await executeQuery(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        `, [process.env.MYSQL_DATABASE, tableName])
        
        if (Array.isArray(tableCheck) && tableCheck.length > 0) {
          salesTable = tableName
          break
        }
      } catch (error) {
        // Continue checking other table names
      }
    }

    if (salesTable) {
      // Get table structure
      try {
        const structure = await executeQuery(`DESCRIBE ${salesTable}`)
        inspection.salesTableStructure = {
          tableName: salesTable,
          columns: structure
        }

        // Get sample data (first 5 rows)
        const sampleData = await executeQuery(`SELECT * FROM ${salesTable} LIMIT 5`)
        inspection.sampleData = sampleData

      } catch (error) {
        inspection.error = `Failed to inspect ${salesTable} table: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    return NextResponse.json(inspection)

  } catch (error) {
    return NextResponse.json({
      connection: false,
      error: `Database inspection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}