'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { TrendingUp, Calendar, AlertCircle, Activity, Clock, Target } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/layout'

interface DemandPattern {
  id: string
  medicine_name: string
  pattern_type: 'seasonal' | 'weekly' | 'monthly' | 'spike'
  confidence_score: number
  next_spike_date: string
  recommended_stock_increase: number
  current_stock: number
  historical_data: Array<{
    date: string
    sales_volume: number
    day_of_week?: string
    month?: string
  }>
  factors: string[]
  peak_periods: string[]
}

interface SalesHeatmapData {
  day: string
  hour: number
  sales: number
}

export default function DemandAnalysisPage() {
  const [patterns, setPatterns] = useState<DemandPattern[]>([])
  const [heatmapData, setHeatmapData] = useState<SalesHeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months')

  useEffect(() => {
    fetchDemandPatterns()
    fetchSalesHeatmap()
  }, [selectedTimeframe])

  const fetchDemandPatterns = async () => {
    try {
      const response = await fetch(`/api/analytics/demand-patterns?timeframe=${selectedTimeframe}`)
      const data = await response.json()
      setPatterns(data.patterns || [])
    } catch (error) {
      console.error('Error fetching demand patterns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesHeatmap = async () => {
    try {
      const response = await fetch('/api/analytics/sales-heatmap')
      const data = await response.json()
      setHeatmapData(data.heatmap || [])
    } catch (error) {
      console.error('Error fetching sales heatmap:', error)
    }
  }

  const updateStockThreshold = async (medicineId: string, newThreshold: number) => {
    try {
      await fetch(`/api/inventory/update-threshold`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: medicineId, threshold: newThreshold })
      })
      alert('Stock threshold updated successfully!')
    } catch (error) {
      console.error('Error updating threshold:', error)
      alert('Failed to update stock threshold')
    }
  }

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'spike': return 'bg-red-100 text-red-800'
      case 'seasonal': return 'bg-blue-100 text-blue-800'
      case 'weekly': return 'bg-green-100 text-green-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const upcomingSpikes = patterns.filter(p => {
    const spikeDate = new Date(p.next_spike_date)
    const now = new Date()
    const daysUntil = (spikeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntil <= 30 && daysUntil > 0
  })

  // Generate heatmap colors
  const maxSales = Math.max(...heatmapData.map(d => d.sales))
  const getHeatmapColor = (sales: number) => {
    const intensity = sales / maxSales
    if (intensity > 0.8) return '#dc2626' // red-600
    if (intensity > 0.6) return '#ea580c' // orange-600
    if (intensity > 0.4) return '#d97706' // amber-600
    if (intensity > 0.2) return '#65a30d' // lime-600
    return '#16a34a' // green-600
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Demand Analysis</h1>
            <p className="text-muted-foreground">Sales patterns, spikes, and seasonal demand detection</p>
          </div>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upcoming Spikes Alert */}
        {upcomingSpikes.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>{upcomingSpikes.length} medicines</strong> are expected to have demand spikes in the next 30 days. 
              Consider increasing stock levels.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patterns Detected</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patterns.length}</div>
              <p className="text-xs text-muted-foreground">Demand patterns identified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Spikes</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{upcomingSpikes.length}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seasonal Patterns</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patterns.filter(p => p.pattern_type === 'seasonal').length}
              </div>
              <p className="text-xs text-muted-foreground">Recurring patterns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {patterns.filter(p => p.confidence_score >= 80).length}
              </div>
              <p className="text-xs text-muted-foreground">≥80% confidence</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Activity Heatmap</CardTitle>
            <CardDescription>
              Sales volume by day of week and hour - darker colors indicate higher sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-24 gap-1 text-xs">
              {/* Hour headers */}
              <div></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-center text-muted-foreground">
                  {i}
                </div>
              ))}
              
              {/* Heatmap data */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="contents">
                  <div className="text-muted-foreground font-medium">{day}</div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const data = heatmapData.find(d => d.day === day && d.hour === hour)
                    const sales = data?.sales || 0
                    return (
                      <div
                        key={hour}
                        className="aspect-square rounded"
                        style={{ backgroundColor: getHeatmapColor(sales) }}
                        title={`${day} ${hour}:00 - ${sales} sales`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Low Activity</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <div className="w-4 h-4 bg-lime-600 rounded"></div>
                <div className="w-4 h-4 bg-amber-600 rounded"></div>
                <div className="w-4 h-4 bg-orange-600 rounded"></div>
                <div className="w-4 h-4 bg-red-600 rounded"></div>
              </div>
              <span>High Activity</span>
            </div>
          </CardContent>
        </Card>

        {/* Demand Patterns */}
        <div className="grid gap-6">
          {patterns.map((pattern) => (
            <Card key={pattern.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{pattern.medicine_name}</CardTitle>
                    <CardDescription>
                      Next spike expected: {new Date(pattern.next_spike_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPatternColor(pattern.pattern_type)}>
                      {pattern.pattern_type.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getConfidenceColor(pattern.confidence_score)}>
                      {pattern.confidence_score}% Confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-lg font-bold">{pattern.current_stock} units</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Recommended Increase</p>
                    <p className="text-lg font-bold text-blue-600">+{pattern.recommended_stock_increase} units</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Pattern Type</p>
                    <p className="text-lg font-bold capitalize">{pattern.pattern_type}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Days Until Spike</p>
                    <p className="text-lg font-bold text-red-600">
                      {Math.ceil((new Date(pattern.next_spike_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>

                {/* Sales Trend Chart */}
                <div className="h-64">
                  <h4 className="text-sm font-medium mb-2">Sales Volume Trend</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pattern.historical_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value) => [`${value} units`, 'Sales Volume']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales_volume" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Pattern Details and Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Peak Periods</h4>
                    <div className="space-y-1">
                      {pattern.peak_periods.map((period, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{period}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-sm font-medium mb-2 mt-4">Contributing Factors</h4>
                    <div className="space-y-1">
                      {pattern.factors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Recommended Action</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Increase stock by <strong>{pattern.recommended_stock_increase} units</strong> before the next spike
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => updateStockThreshold(pattern.id, pattern.current_stock + pattern.recommended_stock_increase)}
                        className="w-full"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Update Stock Threshold
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {patterns.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No demand patterns detected</h3>
            <p className="text-muted-foreground">Pattern analysis will appear here once sufficient sales data is available</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}