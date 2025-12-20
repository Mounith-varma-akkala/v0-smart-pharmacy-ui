'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Phone, Mail, MapPin, TrendingUp, TrendingDown, Package, Clock, Star } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/layout'

interface Supplier {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  medicines_supplied: string[]
  lead_time_days: number
  reliability_rating: number
  price_trend: 'up' | 'down' | 'stable'
  last_order_date: string
  total_orders: number
  on_time_delivery_rate: number
  auto_reorder_enabled: boolean
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "Apollo Supply Chain",
      contact_person: "Rajesh Kumar",
      email: "rajesh@apollo.com",
      phone: "+91-9876543210",
      address: "Mumbai, Maharashtra",
      medicines_supplied: ["Dolo 650", "Azithral 500", "Pan 40", "Glycomet 500"],
      lead_time_days: 3,
      reliability_rating: 4.8,
      price_trend: "stable",
      last_order_date: "2024-12-18",
      total_orders: 156,
      on_time_delivery_rate: 95,
      auto_reorder_enabled: true
    },
    {
      id: "2",
      name: "Hetero Healthcare",
      contact_person: "Priya Sharma",
      email: "priya@hetero.com",
      phone: "+91-9876543211",
      address: "Hyderabad, Telangana",
      medicines_supplied: ["Telma 40", "Allegra 120", "Combiflam", "Becosules"],
      lead_time_days: 5,
      reliability_rating: 4.6,
      price_trend: "down",
      last_order_date: "2024-12-19",
      total_orders: 89,
      on_time_delivery_rate: 92,
      auto_reorder_enabled: true
    },
    {
      id: "3",
      name: "MedPlus Mart",
      contact_person: "Amit Patel",
      email: "amit@medplus.com",
      phone: "+91-9876543212",
      address: "Chennai, Tamil Nadu",
      medicines_supplied: ["Crocin Advance", "Omez 20", "Vitamin D3", "Calcium Sandoz"],
      lead_time_days: 4,
      reliability_rating: 4.4,
      price_trend: "up",
      last_order_date: "2024-12-17",
      total_orders: 134,
      on_time_delivery_rate: 88,
      auto_reorder_enabled: false
    },
    {
      id: "4",
      name: "Cipla Direct",
      contact_person: "Sneha Reddy",
      email: "sneha@cipla.com",
      phone: "+91-9876543213",
      address: "Bangalore, Karnataka",
      medicines_supplied: ["Asthalin Inhaler", "Budecort 200", "Deriphyllin", "Ciprofloxacin 500"],
      lead_time_days: 2,
      reliability_rating: 4.9,
      price_trend: "stable",
      last_order_date: "2024-12-20",
      total_orders: 203,
      on_time_delivery_rate: 98,
      auto_reorder_enabled: true
    },
    {
      id: "5",
      name: "Sun Pharma Distributors",
      contact_person: "Vikram Singh",
      email: "vikram@sunpharma.com",
      phone: "+91-9876543214",
      address: "Delhi, NCR",
      medicines_supplied: ["Brufen 400", "Aspirin 75", "Nimesulide 100", "Tramadol 50"],
      lead_time_days: 6,
      reliability_rating: 4.2,
      price_trend: "up",
      last_order_date: "2024-12-16",
      total_orders: 67,
      on_time_delivery_rate: 85,
      auto_reorder_enabled: false
    },
    {
      id: "6",
      name: "Lupin Pharmaceuticals",
      contact_person: "Kavya Nair",
      email: "kavya@lupin.com",
      phone: "+91-9876543215",
      address: "Pune, Maharashtra",
      medicines_supplied: ["Cephalexin 500", "Doxycycline 100", "Metronidazole 400", "Augmentin 625"],
      lead_time_days: 4,
      reliability_rating: 4.7,
      price_trend: "down",
      last_order_date: "2024-12-19",
      total_orders: 112,
      on_time_delivery_rate: 94,
      auto_reorder_enabled: true
    }
  ])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const data = await response.json()
      if (data.suppliers && data.suppliers.length > 0) {
        setSuppliers(data.suppliers)
      }
      // If no data from API, keep static data
    } catch (error) {
      console.log('Using static demo data - API not available:', error)
      // Keep static data
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoReorder = async (supplierId: string, enabled: boolean) => {
    try {
      await fetch(`/api/suppliers/${supplierId}/auto-reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId 
          ? { ...supplier, auto_reorder_enabled: enabled }
          : supplier
      ))
    } catch (error) {
      console.error('Error updating auto-reorder:', error)
    }
  }

  const requestSupply = async (supplierId: string) => {
    try {
      await fetch(`/api/suppliers/${supplierId}/request-supply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      alert('Supply request sent successfully!')
    } catch (error) {
      console.error('Error requesting supply:', error)
      alert('Failed to send supply request')
    }
  }

  const filteredSuppliers = suppliers
    .filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.medicines_supplied.some(med => 
                             med.toLowerCase().includes(searchTerm.toLowerCase())
                           )
      
      if (filterBy === 'all') return matchesSearch
      if (filterBy === 'high-rating') return matchesSearch && supplier.reliability_rating >= 4
      if (filterBy === 'auto-reorder') return matchesSearch && supplier.auto_reorder_enabled
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'rating': return b.reliability_rating - a.reliability_rating
        case 'lead-time': return a.lead_time_days - b.lead_time_days
        default: return 0
      }
    })

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriceTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
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
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage pharmaceutical suppliers and supply chains</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers or medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="lead-time">Lead Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              <SelectItem value="high-rating">High Rating (4+)</SelectItem>
              <SelectItem value="auto-reorder">Auto-Reorder Enabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Suppliers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.contact_person}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className={`w-4 h-4 ${getRatingColor(supplier.reliability_rating)}`} />
                    <span className={`text-sm font-medium ${getRatingColor(supplier.reliability_rating)}`}>
                      {supplier.reliability_rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{supplier.lead_time_days}d</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lead Time</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="flex items-center justify-center gap-1">
                      {getPriceTrendIcon(supplier.price_trend)}
                      <span className="text-sm font-medium capitalize">{supplier.price_trend}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Price Trend</p>
                  </div>
                </div>

                {/* Medicines Supplied */}
                <div>
                  <p className="text-sm font-medium mb-2">Medicines Supplied:</p>
                  <div className="flex flex-wrap gap-1">
                    {supplier.medicines_supplied.slice(0, 3).map((medicine, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {medicine}
                      </Badge>
                    ))}
                    {supplier.medicines_supplied.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{supplier.medicines_supplied.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">On-time Delivery:</span>
                    <span className="font-medium">{supplier.on_time_delivery_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders:</span>
                    <span className="font-medium">{supplier.total_orders}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => requestSupply(supplier.id)}
                    className="flex-1"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Request Supply
                  </Button>
                  <Button
                    size="sm"
                    variant={supplier.auto_reorder_enabled ? "default" : "outline"}
                    onClick={() => toggleAutoReorder(supplier.id, !supplier.auto_reorder_enabled)}
                  >
                    Auto-Reorder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No suppliers found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}