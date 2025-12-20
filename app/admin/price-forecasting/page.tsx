'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, Calendar, DollarSign } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/layout'

interface PriceForecast {
  id: string
  medicine_name: string
  current_price: number
  predicted_price: number
  price_change_percent: number
  surge_probability: number
  recommended_stock_quantity: number
  current_stock: number
  forecast_date: string
  historical_data: Array<{
    date: string
    price: number
    sales_volume: number
  }>
  factors: string[]
}

export default function PriceForecastingPage() {
  const [forecasts, setForecasts] = useState<PriceForecast[]>([
    {
      id: "1",
      medicine_name: "Dolo 650",
      current_price: 25.00,
      predicted_price: 32.50,
      price_change_percent: 30.0,
      surge_probability: 85,
      recommended_stock_quantity: 500,
      current_stock: 2500,
      forecast_date: "2025-01-15",
      historical_data: [
        { date: "2024-07-01", price: 22.00, sales_volume: 45 },
        { date: "2024-08-01", price: 23.50, sales_volume: 52 },
        { date: "2024-09-01", price: 24.00, sales_volume: 48 },
        { date: "2024-10-01", price: 24.50, sales_volume: 67 },
        { date: "2024-11-01", price: 25.00, sales_volume: 89 },
        { date: "2024-12-01", price: 25.00, sales_volume: 156 }
      ],
      factors: ["Raw material shortage", "Increased demand", "Supply chain disruption", "Seasonal demand spike"]
    },
    {
      id: "2",
      medicine_name: "Azithral 500",
      current_price: 95.00,
      predicted_price: 115.00,
      price_change_percent: 21.1,
      surge_probability: 78,
      recommended_stock_quantity: 200,
      current_stock: 800,
      forecast_date: "2025-01-20",
      historical_data: [
        { date: "2024-07-01", price: 88.00, sales_volume: 25 },
        { date: "2024-08-01", price: 90.00, sales_volume: 28 },
        { date: "2024-09-01", price: 92.00, sales_volume: 32 },
        { date: "2024-10-01", price: 93.50, sales_volume: 38 },
        { date: "2024-11-01", price: 95.00, sales_volume: 42 },
        { date: "2024-12-01", price: 95.00, sales_volume: 58 }
      ],
      factors: ["API price increase", "Manufacturing delays", "Export restrictions", "Quality compliance costs"]
    },
    {
      id: "3",
      medicine_name: "Pan 40",
      current_price: 120.00,
      predicted_price: 138.00,
      price_change_percent: 15.0,
      surge_probability: 72,
      recommended_stock_quantity: 150,
      current_stock: 1200,
      forecast_date: "2025-01-25",
      historical_data: [
        { date: "2024-07-01", price: 115.00, sales_volume: 22 },
        { date: "2024-08-01", price: 116.50, sales_volume: 25 },
        { date: "2024-09-01", price: 118.00, sales_volume: 28 },
        { date: "2024-10-01", price: 119.00, sales_volume: 32 },
        { date: "2024-11-01", price: 120.00, sales_volume: 35 },
        { date: "2024-12-01", price: 120.00, sales_volume: 45 }
      ],
      factors: ["Patent expiry delays", "Generic competition", "Regulatory changes", "Market consolidation"]
    },
    {
      id: "4",
      medicine_name: "Glycomet 500",
      current_price: 18.00,
      predicted_price: 20.70,
      price_change_percent: 15.0,
      surge_probability: 65,
      recommended_stock_quantity: 300,
      current_stock: 3500,
      forecast_date: "2025-02-01",
      historical_data: [
        { date: "2024-07-01", price: 16.50, sales_volume: 35 },
        { date: "2024-08-01", price: 17.00, sales_volume: 38 },
        { date: "2024-09-01", price: 17.25, sales_volume: 41 },
        { date: "2024-10-01", price: 17.75, sales_volume: 44 },
        { date: "2024-11-01", price: 18.00, sales_volume: 47 },
        { date: "2024-12-01", price: 18.00, sales_volume: 55 }
      ],
      factors: ["Diabetes prevalence increase", "Insurance coverage expansion", "Generic market growth", "Bulk procurement"]
    },
    {
      id: "5",
      medicine_name: "Telma 40",
      current_price: 180.00,
      predicted_price: 216.00,
      price_change_percent: 20.0,
      surge_probability: 82,
      recommended_stock_quantity: 100,
      current_stock: 1000,
      forecast_date: "2025-01-30",
      historical_data: [
        { date: "2024-07-01", price: 165.00, sales_volume: 18 },
        { date: "2024-08-01", price: 170.00, sales_volume: 22 },
        { date: "2024-09-01", price: 172.50, sales_volume: 25 },
        { date: "2024-10-01", price: 175.00, sales_volume: 28 },
        { date: "2024-11-01", price: 180.00, sales_volume: 32 },
        { date: "2024-12-01", price: 180.00, sales_volume: 38 }
      ],
      factors: ["Hypertension drug shortage", "Manufacturing facility issues", "Import duty changes", "Brand preference"]
    },
    {
      id: "6",
      medicine_name: "Allegra 120",
      current_price: 160.00,
      predicted_price: 184.00,
      price_change_percent: 15.0,
      surge_probability: 68,
      recommended_stock_quantity: 80,
      current_stock: 600,
      forecast_date: "2025-02-05",
      historical_data: [
        { date: "2024-07-01", price: 148.00, sales_volume: 15 },
        { date: "2024-08-01", price: 152.00, sales_volume: 18 },
        { date: "2024-09-01", price: 155.00, sales_volume: 22 },
        { date: "2024-10-01", price: 158.00, sales_volume: 25 },
        { date: "2024-11-01", price: 160.00, sales_volume: 28 },
        { date: "2024-12-01", price: 160.00, sales_volume: 32 }
      ],
      factors: ["Allergy season demand", "Air quality deterioration", "Respiratory illness increase", "Limited suppliers"]
    }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPriceForecasts()
  }, [])

  const fetchPriceForecasts = async () => {
    try {
      const response = await fetch('/api/forecasting/price-surge')
      const data = await response.json()
      if (data.forecasts && data.forecasts.length > 0) {
        setForecasts(data.forecasts)
      }
      // If no data from API, keep static data
    } catch (error) {
      console.log('Using static demo data - API not available:', error)
      // Keep static data
    } finally {
      setLoading(false)
    }
  }

  const executeRecommendation = async (medicineId: string, quantity: number) => {
    try {
      await fetch('/api/forecasting/execute-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: medicineId, quantity })
      })
      alert('Stock-up order initiated successfully!')
    } catch (error) {
      console.error('Error executing recommendation:', error)
      alert('Failed to initiate stock-up order')
    }
  }

  const getSurgeColor = (probability: number) => {
    if (probability >= 80) return 'text-red-600 bg-red-100'
    if (probability >= 60) return 'text-orange-600 bg-orange-100'
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const highRiskForecasts = forecasts.filter(f => f.surge_probability >= 70)
  const totalRecommendedValue = forecasts.reduce((sum, f) => 
    sum + (f.recommended_stock_quantity * f.current_price), 0
  )

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Price Surge Forecasting</h1>
          <p className="text-muted-foreground">Predict price increases and optimize inventory purchasing</p>
        </div>

        {/* High Risk Alerts */}
        {highRiskForecasts.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{highRiskForecasts.length} medicines</strong> have high price surge probability (≥70%). 
              Consider stocking up before prices increase.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highRiskForecasts.length}</div>
              <p className="text-xs text-muted-foreground">≥70% surge probability</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommended Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRecommendedValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">To avoid price surges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Price Increase</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {forecasts.length > 0 
                  ? (forecasts.reduce((sum, f) => sum + f.price_change_percent, 0) / forecasts.length).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Expected increase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medicines Tracked</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forecasts.length}</div>
              <p className="text-xs text-muted-foreground">Under price monitoring</p>
            </CardContent>
          </Card>
        </div>

        {/* Price Forecasts */}
        <div className="grid gap-6">
          {forecasts.map((forecast) => (
            <Card key={forecast.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{forecast.medicine_name}</CardTitle>
                    <CardDescription>
                      Forecast for {new Date(forecast.forecast_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getSurgeColor(forecast.surge_probability)}>
                    {forecast.surge_probability}% Surge Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-lg font-bold">₹{forecast.current_price}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Predicted Price</p>
                    <p className="text-lg font-bold text-red-600">₹{forecast.predicted_price}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Price Change</p>
                    <p className={`text-lg font-bold ${
                      forecast.price_change_percent > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {forecast.price_change_percent > 0 ? '+' : ''}{forecast.price_change_percent}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-lg font-bold">{forecast.current_stock} units</p>
                  </div>
                </div>

                {/* Price Trend Chart */}
                <div className="h-64">
                  <h4 className="text-sm font-medium mb-2">Price Trend (Last 6 months)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast.historical_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value, name) => [
                          name === 'price' ? `₹${value}` : `${value} units`,
                          name === 'price' ? 'Price' : 'Sales Volume'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="price"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Factors and Recommendation */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Contributing Factors</h4>
                    <div className="space-y-1">
                      {forecast.factors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Stock Recommendation</h4>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>Recommended Stock-up:</strong> {forecast.recommended_stock_quantity} units
                        </p>
                        <p className="text-sm text-blue-700 mb-3">
                          Investment: ₹{(forecast.recommended_stock_quantity * forecast.current_price).toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-700 mb-4">
                          Potential Savings: ₹{(forecast.recommended_stock_quantity * (forecast.predicted_price - forecast.current_price)).toLocaleString()}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => executeRecommendation(forecast.id, forecast.recommended_stock_quantity)}
                          className="w-full"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Execute Stock-up Order
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {forecasts.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No price forecasts available</h3>
            <p className="text-muted-foreground">Price forecasting data will appear here once analysis is complete</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}