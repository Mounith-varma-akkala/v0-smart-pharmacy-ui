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
  const [forecasts, setForecasts] = useState<PriceForecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPriceForecasts()
  }, [])

  const fetchPriceForecasts = async () => {
    try {
      const response = await fetch('/api/forecasting/price-surge')
      const data = await response.json()
      setForecasts(data.forecasts || [])
    } catch (error) {
      console.error('Error fetching price forecasts:', error)
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