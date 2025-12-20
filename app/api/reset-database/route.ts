import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Step 1: Drop existing tables in correct order (handle foreign keys)
    const dropTables = [
      'sales',
      'low_stock_requests', 
      'drug_substitutions',
      'supplier_medicines',
      'medicines',
      'suppliers',
      'users'
    ]

    const dropResults = []
    for (const table of dropTables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

        if (error && !error.message.includes('does not exist')) {
          console.warn(`Warning dropping table ${table}:`, error.message)
        }
        dropResults.push({ table, success: true })
      } catch (err) {
        console.warn(`Could not clear table ${table}:`, err)
        dropResults.push({ table, success: false, error: err })
      }
    }

    // Step 2: Create sample data directly using Supabase client
    
    // Create sample suppliers
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .insert([
        {
          name: 'MediSupply Co.',
          contact_person: 'Rajesh Kumar',
          email: 'contact@medisupply.com',
          phone: '+91-9876543213',
          address: '123 Medical Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postal_code: '400001',
          rating: 4.5
        },
        {
          name: 'PharmaCorp Ltd.',
          contact_person: 'Priya Sharma', 
          email: 'info@pharmacorp.com',
          phone: '+91-9876543214',
          address: '456 Health Avenue',
          city: 'Delhi',
          state: 'Delhi',
          postal_code: '110001',
          rating: 4.2
        },
        {
          name: 'HealthFirst Distributors',
          contact_person: 'Amit Patel',
          email: 'sales@healthfirst.com',
          phone: '+91-9876543215',
          address: '789 Wellness Road',
          city: 'Bangalore',
          state: 'Karnataka',
          postal_code: '560001',
          rating: 4.7
        }
      ])
      .select()

    if (suppliersError) {
      console.error('Error creating suppliers:', suppliersError)
    }

    // Create sample medicines
    const { data: medicines, error: medicinesError } = await supabase
      .from('medicines')
      .insert([
        {
          name: 'Paracetamol 500mg',
          generic_name: 'Paracetamol',
          brand: 'Crocin',
          category: 'Pain Relief',
          dosage_form: 'Tablet',
          strength: '500mg',
          unit_price: 5.00,
          cost_price: 3.50,
          quantity: 500,
          min_stock_level: 50,
          expiry_date: '2025-12-31',
          manufacturer: 'GSK',
          prescription_required: false
        },
        {
          name: 'Amoxicillin 250mg',
          generic_name: 'Amoxicillin',
          brand: 'Amoxil',
          category: 'Antibiotics',
          dosage_form: 'Capsule',
          strength: '250mg',
          unit_price: 15.00,
          cost_price: 10.00,
          quantity: 200,
          min_stock_level: 30,
          expiry_date: '2025-06-30',
          manufacturer: 'Cipla',
          prescription_required: true
        },
        {
          name: 'Cetirizine 10mg',
          generic_name: 'Cetirizine',
          brand: 'Zyrtec',
          category: 'Antihistamine',
          dosage_form: 'Tablet',
          strength: '10mg',
          unit_price: 8.00,
          cost_price: 5.50,
          quantity: 300,
          min_stock_level: 40,
          expiry_date: '2025-09-15',
          manufacturer: 'Dr. Reddy',
          prescription_required: false
        },
        {
          name: 'Metformin 500mg',
          generic_name: 'Metformin',
          brand: 'Glucophage',
          category: 'Diabetes',
          dosage_form: 'Tablet',
          strength: '500mg',
          unit_price: 12.00,
          cost_price: 8.00,
          quantity: 150,
          min_stock_level: 25,
          expiry_date: '2025-11-20',
          manufacturer: 'Sun Pharma',
          prescription_required: true
        },
        {
          name: 'Atorvastatin 20mg',
          generic_name: 'Atorvastatin',
          brand: 'Lipitor',
          category: 'Cardiac',
          dosage_form: 'Tablet',
          strength: '20mg',
          unit_price: 25.00,
          cost_price: 18.00,
          quantity: 100,
          min_stock_level: 20,
          expiry_date: '2025-08-10',
          manufacturer: 'Pfizer',
          prescription_required: true
        },
        {
          name: 'Vitamin D3 60000 IU',
          generic_name: 'Cholecalciferol',
          brand: 'Calcirol',
          category: 'Vitamins',
          dosage_form: 'Capsule',
          strength: '60000 IU',
          unit_price: 35.00,
          cost_price: 25.00,
          quantity: 80,
          min_stock_level: 15,
          expiry_date: '2025-10-05',
          manufacturer: 'Cadila',
          prescription_required: false
        },
        {
          name: 'Omeprazole 20mg',
          generic_name: 'Omeprazole',
          brand: 'Prilosec',
          category: 'Gastric',
          dosage_form: 'Capsule',
          strength: '20mg',
          unit_price: 18.00,
          cost_price: 12.00,
          quantity: 120,
          min_stock_level: 20,
          expiry_date: '2025-07-25',
          manufacturer: 'Lupin',
          prescription_required: true
        },
        {
          name: 'Aspirin 75mg',
          generic_name: 'Aspirin',
          brand: 'Ecosprin',
          category: 'Cardiac',
          dosage_form: 'Tablet',
          strength: '75mg',
          unit_price: 6.00,
          cost_price: 4.00,
          quantity: 400,
          min_stock_level: 50,
          expiry_date: '2025-12-15',
          manufacturer: 'USV',
          prescription_required: false
        },
        {
          name: 'Ibuprofen 400mg',
          generic_name: 'Ibuprofen',
          brand: 'Brufen',
          category: 'Pain Relief',
          dosage_form: 'Tablet',
          strength: '400mg',
          unit_price: 10.00,
          cost_price: 7.00,
          quantity: 250,
          min_stock_level: 35,
          expiry_date: '2025-09-30',
          manufacturer: 'Abbott',
          prescription_required: false
        },
        {
          name: 'Azithromycin 500mg',
          generic_name: 'Azithromycin',
          brand: 'Zithromax',
          category: 'Antibiotics',
          dosage_form: 'Tablet',
          strength: '500mg',
          unit_price: 45.00,
          cost_price: 32.00,
          quantity: 75,
          min_stock_level: 15,
          expiry_date: '2025-05-20',
          manufacturer: 'Pfizer',
          prescription_required: true
        }
      ])
      .select()

    if (medicinesError) {
      console.error('Error creating medicines:', medicinesError)
    }

    // Create sample sales data
    if (medicines && medicines.length > 0) {
      const salesData = []
      const customers = [
        'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 'Vikram Gupta',
        'Neha Agarwal', 'Ravi Verma', 'Kavita Joshi', 'Suresh Reddy', 'Anjali Mehta'
      ]
      const paymentMethods = ['cash', 'card', 'upi', 'insurance']

      // Create 3 sales per medicine for the last 30 days
      for (const medicine of medicines) {
        for (let i = 0; i < 3; i++) {
          const quantity = Math.floor(Math.random() * 5) + 1
          const totalPrice = quantity * medicine.unit_price
          const taxAmount = totalPrice * 0.18
          const finalAmount = totalPrice + taxAmount
          
          // Random date in last 30 days
          const saleDate = new Date()
          saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30))

          salesData.push({
            medicine_id: medicine.id,
            quantity,
            unit_price: medicine.unit_price,
            total_price: totalPrice,
            discount_amount: 0,
            tax_amount: taxAmount,
            final_amount: finalAmount,
            payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            customer_name: customers[Math.floor(Math.random() * customers.length)],
            customer_phone: `+91-${9000000000 + Math.floor(Math.random() * 999999999)}`,
            sale_date: saleDate.toISOString(),
            status: 'completed'
          })
        }
      }

      const { error: salesError } = await supabase
        .from('sales')
        .insert(salesData)

      if (salesError) {
        console.error('Error creating sales:', salesError)
      }
    }

    // Verify the setup
    const { count: medicinesCount } = await supabase
      .from('medicines')
      .select('*', { count: 'exact', head: true })

    const { count: salesCount } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })

    const { count: suppliersCount } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: 'Fresh database created successfully!',
      details: {
        medicinesCount: medicinesCount || 0,
        salesCount: salesCount || 0,
        suppliersCount: suppliersCount || 0,
        dropResults
      }
    })

  } catch (error) {
    console.error('Database reset error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to reset database'
    }, { status: 500 })
  }
}