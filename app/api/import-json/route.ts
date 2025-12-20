import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { jsonData, dataType } = await request.json()

    if (!jsonData || !Array.isArray(jsonData)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON data. Expected an array of objects.'
      }, { status: 400 })
    }

    let results = []
    let successCount = 0
    let errorCount = 0

    switch (dataType) {
      case 'sales':
        results = await importSalesData(supabase, jsonData)
        break
      case 'medicines':
        results = await importMedicinesData(supabase, jsonData)
        break
      case 'purchases':
        results = await importPurchasesData(supabase, jsonData)
        break
      case 'suppliers':
        results = await importSuppliersData(supabase, jsonData)
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid data type. Supported types: sales, medicines, purchases, suppliers'
        }, { status: 400 })
    }

    // Count results
    results.forEach(result => {
      if (result.success) successCount++
      else errorCount++
    })

    return NextResponse.json({
      success: successCount > 0,
      message: `Import completed: ${successCount} successful, ${errorCount} failed`,
      details: {
        totalRecords: jsonData.length,
        successCount,
        errorCount,
        dataType
      },
      results: results.slice(0, 10) // Show first 10 results for debugging
    })

  } catch (error) {
    console.error('JSON import error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

async function importSalesData(supabase: any, salesData: any[]) {
  const results = []
  
  for (const sale of salesData) {
    try {
      // Map JSON fields to database schema
      const saleRecord = {
        // Try different possible field names from JSON
        quantity: sale.Qty_Sold || sale.quantity || sale.qty || 1,
        unit_price: sale.Unit_Price || sale.unit_price || sale.price || 0,
        total_price: sale.Total_Amount || sale.total_price || sale.amount || 0,
        payment_method: sale.Payment_Method || sale.payment_method || 'cash',
        customer_name: sale.Customer_Name || sale.customer_name || sale.customer || 'Walk-in Customer',
        customer_phone: sale.Customer_Phone || sale.customer_phone || sale.phone || null,
        sale_date: sale.Date || sale.sale_date || sale.date || new Date().toISOString(),
        medicine_id: sale.Medicine_ID || sale.medicine_id || null,
        // Calculate fields
        discount_amount: sale.Discount || sale.discount_amount || 0,
        tax_amount: sale.Tax || sale.tax_amount || 0,
        final_amount: sale.Final_Amount || sale.final_amount || (sale.Total_Amount || sale.total_price || sale.amount || 0),
        status: 'completed'
      }

      // If no medicine_id provided, try to find medicine by name
      if (!saleRecord.medicine_id && (sale.Drug_Name || sale.medicine_name || sale.drug)) {
        const medicineName = sale.Drug_Name || sale.medicine_name || sale.drug
        const { data: medicine } = await supabase
          .from('medicines')
          .select('id')
          .ilike('name', `%${medicineName}%`)
          .limit(1)
          .single()
        
        if (medicine) {
          saleRecord.medicine_id = medicine.id
        }
      }

      const { data, error } = await supabase
        .from('sales')
        .insert([saleRecord])
        .select()

      if (error) {
        results.push({ success: false, error: error.message, data: sale })
      } else {
        results.push({ success: true, data: data[0] })
      }
    } catch (err) {
      results.push({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        data: sale 
      })
    }
  }

  return results
}

async function importMedicinesData(supabase: any, medicinesData: any[]) {
  const results = []
  
  for (const medicine of medicinesData) {
    try {
      const medicineRecord = {
        name: medicine.Drug_Name || medicine.name || medicine.medicine_name || 'Unknown Medicine',
        generic_name: medicine.Generic_Name || medicine.generic_name || null,
        brand: medicine.Brand || medicine.brand || null,
        category: medicine.Category || medicine.category || 'General',
        dosage_form: medicine.Dosage_Form || medicine.dosage_form || 'Tablet',
        strength: medicine.Strength || medicine.strength || null,
        unit_price: parseFloat(medicine.Unit_Price || medicine.unit_price || medicine.price || 0),
        cost_price: parseFloat(medicine.Cost_Price || medicine.cost_price || medicine.cost || 0),
        quantity: parseInt(medicine.Quantity || medicine.quantity || medicine.stock || 0),
        min_stock_level: parseInt(medicine.Min_Stock || medicine.min_stock_level || 10),
        max_stock_level: parseInt(medicine.Max_Stock || medicine.max_stock_level || 1000),
        batch_number: medicine.Batch_Number || medicine.batch_number || null,
        expiry_date: medicine.Expiry_Date || medicine.expiry_date || '2025-12-31',
        manufacturer: medicine.Manufacturer || medicine.manufacturer || null,
        prescription_required: medicine.Prescription_Required || medicine.prescription_required || false,
        is_active: medicine.Is_Active !== false // Default to true unless explicitly false
      }

      const { data, error } = await supabase
        .from('medicines')
        .insert([medicineRecord])
        .select()

      if (error) {
        results.push({ success: false, error: error.message, data: medicine })
      } else {
        results.push({ success: true, data: data[0] })
      }
    } catch (err) {
      results.push({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        data: medicine 
      })
    }
  }

  return results
}

async function importPurchasesData(supabase: any, purchasesData: any[]) {
  // Convert purchases to medicines inventory updates
  const results = []
  
  for (const purchase of purchasesData) {
    try {
      // First, try to find existing medicine
      const medicineName = purchase.Drug_Name || purchase.medicine_name || purchase.drug
      const { data: existingMedicine } = await supabase
        .from('medicines')
        .select('id, quantity')
        .ilike('name', `%${medicineName}%`)
        .limit(1)
        .single()

      if (existingMedicine) {
        // Update existing medicine quantity
        const newQuantity = existingMedicine.quantity + (parseInt(purchase.Quantity || purchase.quantity || 0))
        
        const { data, error } = await supabase
          .from('medicines')
          .update({ 
            quantity: newQuantity,
            cost_price: parseFloat(purchase.Unit_Cost || purchase.unit_cost || purchase.cost || 0),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMedicine.id)
          .select()

        if (error) {
          results.push({ success: false, error: error.message, data: purchase })
        } else {
          results.push({ success: true, data: data[0], action: 'updated_inventory' })
        }
      } else {
        // Create new medicine from purchase data
        const medicineRecord = {
          name: medicineName,
          category: purchase.Category || purchase.category || 'General',
          unit_price: parseFloat(purchase.Selling_Price || purchase.selling_price || purchase.price || 0),
          cost_price: parseFloat(purchase.Unit_Cost || purchase.unit_cost || purchase.cost || 0),
          quantity: parseInt(purchase.Quantity || purchase.quantity || 0),
          min_stock_level: 10,
          expiry_date: purchase.Expiry_Date || purchase.expiry_date || '2025-12-31',
          manufacturer: purchase.Supplier || purchase.supplier || purchase.manufacturer || null,
          batch_number: purchase.Batch_Number || purchase.batch_number || null
        }

        const { data, error } = await supabase
          .from('medicines')
          .insert([medicineRecord])
          .select()

        if (error) {
          results.push({ success: false, error: error.message, data: purchase })
        } else {
          results.push({ success: true, data: data[0], action: 'created_medicine' })
        }
      }
    } catch (err) {
      results.push({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        data: purchase 
      })
    }
  }

  return results
}

async function importSuppliersData(supabase: any, suppliersData: any[]) {
  const results = []
  
  for (const supplier of suppliersData) {
    try {
      const supplierRecord = {
        name: supplier.Supplier_Name || supplier.name || supplier.supplier_name || 'Unknown Supplier',
        contact_person: supplier.Contact_Person || supplier.contact_person || supplier.contact || null,
        email: supplier.Email || supplier.email || null,
        phone: supplier.Phone || supplier.phone || supplier.contact_number || null,
        address: supplier.Address || supplier.address || null,
        city: supplier.City || supplier.city || null,
        state: supplier.State || supplier.state || null,
        postal_code: supplier.Postal_Code || supplier.postal_code || supplier.zip || null,
        country: supplier.Country || supplier.country || 'India',
        rating: parseFloat(supplier.Rating || supplier.rating || 0),
        is_active: supplier.Is_Active !== false
      }

      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierRecord])
        .select()

      if (error) {
        results.push({ success: false, error: error.message, data: supplier })
      } else {
        results.push({ success: true, data: data[0] })
      }
    } catch (err) {
      results.push({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        data: supplier 
      })
    }
  }

  return results
}