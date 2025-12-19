import { useState, useEffect, useCallback } from 'react'

interface SalesData {
  id: number
  medicine_id: number
  quantity: number
  unit_price: number
  total_price: number
  sale_date: string
  payment_method: string
  customer_name?: string
  customer_phone?: string
  user_id?: string
  medicine_name?: string
  medicine_category?: string
}

interface SalesStats {
  total_transactions: number
  total_units_sold: number
  total_revenue: number
  average_sale_value: number
  unique_customers: number
}

interface SalesTrend {
  sale_day: string
  transactions: number
  revenue: number
  units_sold: number
}

interface PaymentMethodStats {
  payment_method: string
  transaction_count: number
  revenue: number
}

interface TopMedicine {
  medicine_name: string
  category: string
  total_sold: number
  revenue: number
}

interface SalesStatsResponse {
  summary: SalesStats
  paymentMethods: PaymentMethodStats[]
  topMedicines: TopMedicine[]
  salesTrend: SalesTrend[]
  period: string
}

export function useMySQLSales(startDate?: string, endDate?: string, limit?: number) {
  const [sales, setSales] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (limit) params.append('limit', limit.toString())

      const response = await fetch(`/api/sales?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setSales(result.data)
      } else {
        setError(result.error || 'Failed to fetch sales data')
      }
    } catch (err) {
      setError('Network error while fetching sales data')
      console.error('Sales fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, limit])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const refetch = useCallback(() => {
    fetchSales()
  }, [fetchSales])

  return { sales, loading, error, refetch }
}

export function useMySQLSalesStats(period: 'today' | 'week' | 'month' | 'year' = 'today') {
  const [stats, setStats] = useState<SalesStatsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sales/stats?period=${period}`)
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      } else {
        setError(result.error || 'Failed to fetch sales statistics')
      }
    } catch (err) {
      setError('Network error while fetching sales statistics')
      console.error('Sales stats fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refetch = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch }
}

export async function createSale(saleData: Omit<SalesData, 'id' | 'sale_date'>) {
  try {
    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    })

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create sale')
    }

    return result.data
  } catch (error) {
    console.error('Create sale error:', error)
    throw error
  }
}