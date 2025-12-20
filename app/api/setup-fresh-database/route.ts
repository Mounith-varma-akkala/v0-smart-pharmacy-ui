import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST() {
  try {
    const supabase = await createClient()

    // Read the SQL setup script
    const sqlScript = readFileSync(
      join(process.cwd(), 'scripts', 'fresh-database-setup.sql'),
      'utf8'
    )

    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    const results = []
    let successCount = 0
    let errorCount = 0

    // Execute each statement
    for (const statement of statements) {
      try {
        if (statement.toLowerCase().includes('commit')) {
          continue // Skip COMMIT statements as Supabase handles transactions automatically
        }

        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        })

        if (error) {
          console.error(`Error executing statement: ${statement.substring(0, 100)}...`, error)
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: false,
            error: error.message
          })
          errorCount++
        } else {
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: true,
            data
          })
          successCount++
        }
      } catch (err) {
        console.error(`Exception executing statement: ${statement.substring(0, 100)}...`, err)
        results.push({
          statement: statement.substring(0, 100) + '...',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
        errorCount++
      }
    }

    // Verify tables were created by checking a few key tables
    const { data: tablesCheck } = await supabase
      .from('medicines')
      .select('count', { count: 'exact', head: true })

    const { data: salesCheck } = await supabase
      .from('sales')
      .select('count', { count: 'exact', head: true })

    return NextResponse.json({
      success: successCount > errorCount,
      message: `Database setup completed. ${successCount} statements succeeded, ${errorCount} failed.`,
      details: {
        totalStatements: statements.length,
        successCount,
        errorCount,
        medicinesCount: tablesCheck?.count || 0,
        salesCount: salesCheck?.count || 0
      },
      results: results.slice(-10) // Return last 10 results for debugging
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to set up fresh database'
    }, { status: 500 })
  }
}

// Alternative approach using direct SQL execution
export async function PUT() {
  try {
    const supabase = await createClient()

    // Create tables one by one with proper error handling
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
            phone VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      {
        name: 'suppliers',
        sql: `
          CREATE TABLE IF NOT EXISTS suppliers (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            contact_person VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(20),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            postal_code VARCHAR(20),
            country VARCHAR(100) DEFAULT 'India',
            is_active BOOLEAN DEFAULT true,
            rating DECIMAL(3,2) DEFAULT 0.00,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      {
        name: 'medicines',
        sql: `
          CREATE TABLE IF NOT EXISTS medicines (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            generic_name VARCHAR(255),
            brand VARCHAR(255),
            category VARCHAR(100) NOT NULL,
            dosage_form VARCHAR(100),
            strength VARCHAR(100),
            unit_price DECIMAL(10,2) NOT NULL,
            cost_price DECIMAL(10,2),
            quantity INTEGER NOT NULL DEFAULT 0,
            min_stock_level INTEGER DEFAULT 10,
            max_stock_level INTEGER DEFAULT 1000,
            batch_number VARCHAR(100),
            manufacturing_date DATE,
            expiry_date DATE NOT NULL,
            manufacturer VARCHAR(255),
            supplier_id UUID,
            prescription_required BOOLEAN DEFAULT false,
            storage_conditions TEXT,
            side_effects TEXT,
            contraindications TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      {
        name: 'sales',
        sql: `
          CREATE TABLE IF NOT EXISTS sales (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            medicine_id UUID NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            discount_amount DECIMAL(10,2) DEFAULT 0.00,
            tax_amount DECIMAL(10,2) DEFAULT 0.00,
            final_amount DECIMAL(10,2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'insurance')),
            customer_name VARCHAR(255),
            customer_phone VARCHAR(20),
            customer_email VARCHAR(255),
            prescription_id VARCHAR(100),
            sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID,
            notes TEXT,
            status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      }
    ]

    const results = []
    
    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: table.sql
        })

        if (error) {
          results.push({ table: table.name, success: false, error: error.message })
        } else {
          results.push({ table: table.name, success: true })
        }
      } catch (err) {
        results.push({ 
          table: table.name, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      results
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}