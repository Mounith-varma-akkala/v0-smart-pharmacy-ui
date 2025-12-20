'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Database, Loader2, AlertTriangle, Package, Users, Calendar, TrendingUp, Pill, ShoppingCart } from 'lucide-react'

interface PopulationResult {
  feature: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  data?: any
}

export default function PopulateDataPage() {
  const [results, setResults] = useState<PopulationResult[]>([
    { feature: 'suppliers', status: 'idle' },
    { feature: 'inventory_batches', status: 'idle' },
    { feature: 'drug_substitutes', status: 'idle' },
    { feature: 'demand_patterns', status: 'idle' },
    { feature: 'price_forecasts', status: 'idle' },
    { feature: 'low_stock_requests', status: 'idle' }
  ])

  const [isPopulatingAll, setIsPopulatingAll] = useState(false)

  const featureInfo = {
    suppliers: {
      title: 'Suppliers Management',
      description: 'Pharmaceutical suppliers with performance metrics',
      icon: Users,
      color: 'bg-blue-100 text-blue-800'
    },
    inventory_batches: {
      title: 'FEFO Inventory Batches',
      description: 'Batch-level inventory with expiry dates',
      icon: Package,
      color: 'bg-green-100 text-green-800'
    },
    drug_substitutes: {
      title: 'Drug Substitution Mapping',
      description: 'Medicine equivalency and substitution data',
      icon: Pill,
      color: 'bg-purple-100 text-purple-800'
    },
    demand_patterns: {
      title: 'Demand Analysis Patterns',
      description: 'Sales patterns and demand forecasting data',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-800'
    },
    price_forecasts: {
      title: 'Price Surge Forecasts',
      description: 'Price predictions and stock recommendations',
      icon: Calendar,
      color: 'bg-red-100 text-red-800'
    },
    low_stock_requests: {
      title: 'Low Stock Requests',
      description: 'Sample low stock requests for workflow testing',
      icon: ShoppingCart,
      color: 'bg-yellow-100 text-yellow-800'
    }
  }

  const populateFeature = async (feature: string) => {
    setResults(prev => prev.map(r => 
      r.feature === feature ? { ...r, status: 'loading' } : r
    ))

    try {
      const response = await fetch('/api/populate-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature })
      })

      const data = await response.json()

      if (response.ok) {
        setResults(prev => prev.map(r => 
          r.feature === feature 
            ? { ...r, status: 'success', message: data.message, data: data }
            : r
        ))
      } else {
        setResults(prev => prev.map(r => 
          r.feature === feature 
            ? { ...r, status: 'error', message: data.error || 'Failed to populate' }
            : r
        ))
      }
    } catch (error) {
      setResults(prev => prev.map(r => 
        r.feature === feature 
          ? { ...r, status: 'error', message: 'Network error occurred' }
          : r
      ))
    }
  }

  const populateAllFeatures = async () => {
    setIsPopulatingAll(true)
    
    // Reset all statuses
    setResults(prev => prev.map(r => ({ ...r, status: 'idle' })))

    // Populate features in sequence to handle dependencies
    const features = ['suppliers', 'inventory_batches', 'drug_substitutes', 'low_stock_requests']
    
    for (const feature of features) {
      await populateFeature(feature)
      // Small delay between features
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Generate demand patterns and price forecasts (these don't need database inserts)
    await populateFeature('demand_patterns')
    await populateFeature('price_forecasts')

    setIsPopulatingAll(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'bg-blue-100 text-blue-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const loadingCount = results.filter(r => r.status === 'loading').length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Pharm Data Population</h1>
          <p className="text-muted-foreground text-lg">
            Populate your database with realistic data for all pharmacy features
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Features</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Loader2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{loadingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={populateAllFeatures} 
            disabled={isPopulatingAll}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPopulatingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Populating All Features...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Populate All Features
              </>
            )}
          </Button>
        </div>

        {/* Prerequisites Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Prerequisites:</strong> Make sure you have:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Run the database schema: <code>scripts/pharmacy_features_schema.sql</code></li>
              <li>Have some existing medicines in your database</li>
              <li>Have some inventory records</li>
              <li>Have some sales data for pattern analysis</li>
            </ul>
            <div className="mt-3 flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  const response = await fetch('/api/setup-database', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'check_readiness' })
                  })
                  const data = await response.json()
                  alert(JSON.stringify(data, null, 2))
                }}
              >
                Check Database Readiness
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  const response = await fetch('/api/setup-database', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'setup_sample_data' })
                  })
                  const data = await response.json()
                  alert(data.message || data.error)
                }}
              >
                Setup Sample Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => {
            const info = featureInfo[result.feature as keyof typeof featureInfo]
            const IconComponent = info.icon

            return (
              <Card key={result.feature} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${info.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{info.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {info.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1 capitalize">{result.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.message && (
                    <div className={`p-3 rounded text-sm ${
                      result.status === 'success' ? 'bg-green-50 text-green-800' :
                      result.status === 'error' ? 'bg-red-50 text-red-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {result.message}
                    </div>
                  )}

                  {result.data && result.status === 'success' && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {result.data.forecasts && (
                        <p>• Generated {result.data.forecasts.length} price forecasts</p>
                      )}
                      {result.data.heatmapData && (
                        <p>• Created {result.data.heatmapData.length} heatmap data points</p>
                      )}
                      {result.data.patternsFound && (
                        <p>• Analyzed {result.data.patternsFound} medicine patterns</p>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={() => populateFeature(result.feature)}
                    disabled={result.status === 'loading' || isPopulatingAll}
                    variant="outline"
                    className="w-full"
                  >
                    {result.status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Populating...
                      </>
                    ) : result.status === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Re-populate
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Populate Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Success Message */}
        {successCount === results.length && successCount > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎉 All features populated successfully!</strong> Your pharmacy system is now ready with realistic data. 
              You can now test all features with real data in your dashboard.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}