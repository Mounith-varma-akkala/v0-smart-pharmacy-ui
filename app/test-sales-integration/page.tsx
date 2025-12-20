"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Sale {
  id: number
  medicine_id: number
  quantity: number
  unit_price: number
  total_price: number
  sale_date: string
  payment_method: string
  customer_name: string
  customer_phone: string
  user_id: string
  medicine_name: string
  medicine_category: string
}

interface SalesStats {
  summary: {
    total_transactions: number
    total_units_sold: number
    total_revenue: number
    average_sale_value: number
    unique_customers: number
  }
  paymentMethods: Array<{
    payment_method: string
    transaction_count: number
    revenue: number
  }>
  topMedicines: Array<{
    medicine_name: string
    category: string
    total_sold: number
    revenue: number
  }>
  salesTrend: Array<{
    sale_day: string
    transactions: number
    revenue: number
    units_sold: number
  }>
  period: string
}

export default function TestSalesIntegration() {
  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<SalesStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/sales?limit=10')
      const data = await response.json()
      
      if (data.success) {
        setSales(data.data)
      } else {
        setError(data.error || 'Failed to fetch sales')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (period: string = 'today') => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/sales/stats?period=${period}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
    fetchStats()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Integration Test</h1>
        <div className="space-x-2">
          <Button onClick={fetchSales} disabled={loading}>
            Refresh Sales
          </Button>
          <Button onClick={() => fetchStats('today')} disabled={loading}>
            Today Stats
          </Button>
          <Button onClick={() => fetchStats('week')} disabled={loading}>
            Week Stats
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">Error: {error}</p>
        </Card>
      )}

      {loading && (
        <Card className="p-4">
          <p>Loading...</p>
        </Card>
      )}

      {/* Sales Stats */}
      {stats && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Statistics ({stats.period})</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.summary.total_transactions}</p>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.summary.total_units_sold}</p>
              <p className="text-sm text-gray-600">Units Sold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">₹{stats.summary.total_revenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">₹{stats.summary.average_sale_value.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Avg Sale Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.summary.unique_customers}</p>
              <p className="text-sm text-gray-600">Unique Customers</p>
            </div>
          </div>

          {/* Top Medicines */}
          {stats.topMedicines.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Top Medicines</h3>
              <div className="space-y-2">
                {stats.topMedicines.slice(0, 5).map((medicine, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{medicine.medicine_name}</p>
                      <p className="text-sm text-gray-600">{medicine.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{medicine.total_sold} units</p>
                      <p className="text-sm text-gray-600">₹{medicine.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {stats.paymentMethods.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Payment Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.paymentMethods.map((method, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="font-medium">{method.payment_method}</p>
                    <p className="text-sm text-gray-600">{method.transaction_count} transactions</p>
                    <p className="text-sm text-gray-600">₹{method.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Recent Sales */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sales ({sales.length} records)</h2>
        {sales.length === 0 ? (
          <p className="text-gray-500">No sales data found</p>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{sale.medicine_name}</p>
                    <Badge variant="secondary">{sale.medicine_category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Customer: {sale.customer_name || 'Walk-in'} | 
                    Qty: {sale.quantity} | 
                    Unit Price: ₹{sale.unit_price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{sale.total_price}</p>
                  <p className="text-sm text-gray-600">{sale.payment_method}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}