'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Calendar, AlertTriangle, Package, Clock, Filter } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/layout'

interface InventoryBatch {
  id: string
  medicine_name: string
  batch_number: string
  expiry_date: string
  quantity: number
  cost_price: number
  supplier_name: string
  days_to_expiry: number
  expiry_status: 'expired' | 'critical' | 'warning' | 'safe'
  suggested_for_sale: boolean
}

export default function ExpiryManagementPage() {
  const [batches, setBatches] = useState<InventoryBatch[]>([
    {
      id: "1",
      medicine_name: "Dolo 650",
      batch_number: "DL2024001",
      expiry_date: "2024-12-25",
      quantity: 50,
      cost_price: 18.50,
      supplier_name: "Micro Labs",
      days_to_expiry: 5,
      expiry_status: "critical",
      suggested_for_sale: true
    },
    {
      id: "2",
      medicine_name: "Azithral 500",
      batch_number: "AZ2024002",
      expiry_date: "2024-12-22",
      quantity: 25,
      cost_price: 70.00,
      supplier_name: "Alembic Pharma",
      days_to_expiry: 2,
      expiry_status: "critical",
      suggested_for_sale: true
    },
    {
      id: "3",
      medicine_name: "Pan 40",
      batch_number: "PN2024003",
      expiry_date: "2024-12-15",
      quantity: 30,
      cost_price: 88.00,
      supplier_name: "Alkem Labs",
      days_to_expiry: -5,
      expiry_status: "expired",
      suggested_for_sale: false
    },
    {
      id: "4",
      medicine_name: "Crocin Advance",
      batch_number: "CR2024007",
      expiry_date: "2025-01-15",
      quantity: 100,
      cost_price: 16.00,
      supplier_name: "GSK",
      days_to_expiry: 26,
      expiry_status: "warning",
      suggested_for_sale: true
    },
    {
      id: "5",
      medicine_name: "Combiflam",
      batch_number: "CB2024008",
      expiry_date: "2025-01-10",
      quantity: 75,
      cost_price: 25.00,
      supplier_name: "Sanofi",
      days_to_expiry: 21,
      expiry_status: "warning",
      suggested_for_sale: true
    },
    {
      id: "6",
      medicine_name: "Glycomet 500",
      batch_number: "GM2024004",
      expiry_date: "2025-03-15",
      quantity: 200,
      cost_price: 13.00,
      supplier_name: "USV Ltd",
      days_to_expiry: 85,
      expiry_status: "safe",
      suggested_for_sale: false
    },
    {
      id: "7",
      medicine_name: "Telma 40",
      batch_number: "TM2024005",
      expiry_date: "2025-02-28",
      quantity: 80,
      cost_price: 132.00,
      supplier_name: "Glenmark",
      days_to_expiry: 70,
      expiry_status: "safe",
      suggested_for_sale: false
    },
    {
      id: "8",
      medicine_name: "Allegra 120",
      batch_number: "AL2024006",
      expiry_date: "2024-12-28",
      quantity: 40,
      cost_price: 118.00,
      supplier_name: "Sanofi",
      days_to_expiry: 8,
      expiry_status: "critical",
      suggested_for_sale: true
    },
    {
      id: "9",
      medicine_name: "Becosules",
      batch_number: "BC2024009",
      expiry_date: "2025-01-20",
      quantity: 60,
      cost_price: 32.00,
      supplier_name: "Pfizer",
      days_to_expiry: 31,
      expiry_status: "safe",
      suggested_for_sale: false
    },
    {
      id: "10",
      medicine_name: "Omez 20",
      batch_number: "OM2024010",
      expiry_date: "2024-12-30",
      quantity: 35,
      cost_price: 62.00,
      supplier_name: "Dr. Reddys",
      days_to_expiry: 10,
      expiry_status: "critical",
      suggested_for_sale: true
    }
  ])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [alertDays, setAlertDays] = useState(30)

  useEffect(() => {
    fetchInventoryBatches()
  }, [alertDays])

  const fetchInventoryBatches = async () => {
    try {
      const response = await fetch(`/api/inventory/expiry?alert_days=${alertDays}`)
      const data = await response.json()
      if (data.batches && data.batches.length > 0) {
        setBatches(data.batches)
      }
      // If no data from API, keep static data
    } catch (error) {
      console.log('Using static demo data - API not available:', error)
      // Keep static data
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200'
      case 'critical': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'safe': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'critical': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'safe': return <Package className="w-4 h-4 text-green-500" />
      default: return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredBatches = batches
    .filter(batch => {
      const matchesSearch = batch.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (filterStatus === 'all') return matchesSearch
      return matchesSearch && batch.expiry_status === filterStatus
    })
    .sort((a, b) => {
      // FEFO: Sort by expiry date (earliest first)
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    })

  const criticalBatches = batches.filter(batch => 
    batch.expiry_status === 'expired' || batch.expiry_status === 'critical'
  )

  const totalValue = batches.reduce((sum, batch) => sum + (batch.quantity * batch.cost_price), 0)
  const criticalValue = criticalBatches.reduce((sum, batch) => sum + (batch.quantity * batch.cost_price), 0)

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
          <h1 className="text-3xl font-bold">Expiry Management (FEFO)</h1>
          <p className="text-muted-foreground">First Expiry First Out - Manage inventory by expiration dates</p>
        </div>

        {/* Critical Alerts */}
        {criticalBatches.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{criticalBatches.length} batches</strong> are expired or expiring soon! 
              Total value at risk: <strong>₹{criticalValue.toLocaleString()}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batches.length}</div>
              <p className="text-xs text-muted-foreground">
                Value: ₹{totalValue.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {batches.filter(b => b.expiry_status === 'expired').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical (≤7 days)</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {batches.filter(b => b.expiry_status === 'critical').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning (≤30 days)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {batches.filter(b => b.expiry_status === 'warning').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines or batch numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="critical">Critical (≤7 days)</SelectItem>
              <SelectItem value="warning">Warning (≤30 days)</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={alertDays.toString()} onValueChange={(value) => setAlertDays(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Alert threshold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inventory Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Batches (FEFO Order)</CardTitle>
            <CardDescription>
              Batches sorted by expiry date - earliest first for optimal stock rotation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBatches.map((batch) => (
                <div 
                  key={batch.id} 
                  className={`p-4 rounded-lg border-2 ${
                    batch.suggested_for_sale ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                  } ${getStatusColor(batch.expiry_status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(batch.expiry_status)}
                        <h3 className="font-semibold">{batch.medicine_name}</h3>
                        {batch.suggested_for_sale && (
                          <Badge variant="default" className="bg-blue-600">
                            FEFO Suggested
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Batch Number</p>
                          <p className="font-medium">{batch.batch_number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{batch.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expiry Date</p>
                          <p className="font-medium">
                            {new Date(batch.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days to Expiry</p>
                          <p className={`font-medium ${
                            batch.days_to_expiry < 0 ? 'text-red-600' : 
                            batch.days_to_expiry <= 7 ? 'text-orange-600' : 
                            batch.days_to_expiry <= 30 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {batch.days_to_expiry < 0 ? 'EXPIRED' : `${batch.days_to_expiry} days`}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground">Supplier</p>
                          <p className="font-medium">{batch.supplier_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost Price</p>
                          <p className="font-medium">₹{batch.cost_price}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Value</p>
                          <p className="font-medium">₹{(batch.quantity * batch.cost_price).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Badge className={getStatusColor(batch.expiry_status)}>
                        {batch.expiry_status.toUpperCase()}
                      </Badge>
                      {batch.expiry_status === 'expired' || batch.expiry_status === 'critical' ? (
                        <Button size="sm" variant="destructive">
                          Mark for Disposal
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          Prioritize Sale
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBatches.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No batches found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}