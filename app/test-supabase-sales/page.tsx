'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabaseSalesPage() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [salesStats, setSalesStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const supabase = createClient()

  const fetchSalesData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Fetch sales data with medicine details
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          quantity,
          total_price,
          sale_date,
          medicines (
            name,
            category,
            price
          )
        `)
        .order('sale_date', { ascending: false })
        .limit(10)

      if (salesError) {
        throw salesError
      }

      setSalesData(sales || [])

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const { data: todaySales } = await supabase
        .from('sales')
        .select('quantity, total_price')
        .gte('sale_date', `${today}T00:00:00`)
        .lte('sale_date', `${today}T23:59:59`)

      const { count: totalSales } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })

      const todayQuantity = todaySales?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0
      const todayRevenue = todaySales?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0

      setSalesStats({
        totalSales: totalSales || 0,
        todayQuantity,
        todayRevenue,
        hasData: (sales?.length || 0) > 0
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const addSampleSales = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/add-sample-sales', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchSalesData() // Refresh data
      } else {
        setError(result.error || 'Failed to add sample sales')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesData()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Supabase Sales Data Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Statistics</CardTitle>
            <CardDescription>Current sales data from Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesStats && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Sales Records:</span>
                  <span className="font-medium">{salesStats.totalSales}</span>
                </div>
                <div className="flex justify-between">
                  <span>Today's Units Sold:</span>
                  <span className="font-medium">{salesStats.todayQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Today's Revenue:</span>
                  <span className="font-medium">${salesStats.todayRevenue?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Status:</span>
                  <span className={`font-medium ${salesStats.hasData ? 'text-green-600' : 'text-red-600'}`}>
                    {salesStats.hasData ? 'Has Data' : 'No Data'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={fetchSalesData} disabled={loading}>
                Refresh Data
              </Button>
              <Button onClick={addSampleSales} disabled={loading} variant="outline">
                Add Sample Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Connection and data status</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {!error && salesStats && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✅ Successfully connected to Supabase sales table
                </p>
              </div>
            )}
            
            {loading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Data</CardTitle>
          <CardDescription>Last 10 sales records from your Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          {salesData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Medicine</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Quantity</th>
                    <th className="text-left p-2">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale, index) => (
                    <tr key={sale.id} className="border-b">
                      <td className="p-2">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                      <td className="p-2">{sale.medicines?.name || 'Unknown'}</td>
                      <td className="p-2">{sale.medicines?.category || 'N/A'}</td>
                      <td className="p-2">{sale.quantity}</td>
                      <td className="p-2">${sale.total_price?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No sales data found</p>
              <Button onClick={addSampleSales} className="mt-4" disabled={loading}>
                Add Sample Sales Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}