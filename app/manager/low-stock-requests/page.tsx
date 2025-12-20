'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Package, Plus, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/layout'

interface LowStockRequest {
  id: string
  medicine_name: string
  current_stock: number
  requested_quantity: number
  reason: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'approved' | 'rejected'
  requested_by: string
  requested_at: string
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
}

export default function LowStockRequestsPage() {
  const [requests, setRequests] = useState<LowStockRequest[]>([
    {
      id: "1",
      medicine_name: "Dolo 650",
      current_stock: 15,
      requested_quantity: 500,
      reason: "Stock running critically low due to high demand during winter season. We've had multiple customers asking for this medicine and we're almost out of stock.",
      urgency: "critical",
      status: "pending",
      requested_by: "Manager John",
      requested_at: "2024-12-20T10:30:00Z"
    },
    {
      id: "2",
      medicine_name: "Azithral 500",
      current_stock: 8,
      requested_quantity: 200,
      reason: "Antibiotic demand has increased significantly due to respiratory infections in the area. Current stock will last only 2-3 days.",
      urgency: "high",
      status: "approved",
      requested_by: "Manager Sarah",
      requested_at: "2024-12-19T14:15:00Z",
      reviewed_by: "Admin Kumar",
      reviewed_at: "2024-12-19T16:45:00Z",
      review_notes: "Approved. High demand confirmed. Order placed with supplier for immediate delivery."
    },
    {
      id: "3",
      medicine_name: "Pan 40",
      current_stock: 25,
      requested_quantity: 300,
      reason: "Regular prescription medicine with steady demand. Stock will be depleted within a week based on current sales pattern.",
      urgency: "medium",
      status: "approved",
      requested_by: "Manager Mike",
      requested_at: "2024-12-18T09:20:00Z",
      reviewed_by: "Admin Priya",
      reviewed_at: "2024-12-18T11:30:00Z",
      review_notes: "Approved. Standard replenishment request. Order scheduled for next delivery cycle."
    },
    {
      id: "4",
      medicine_name: "Expensive Injection XYZ",
      current_stock: 2,
      requested_quantity: 50,
      reason: "Requesting large quantity for bulk discount. This is an expensive medicine and bulk purchase would save costs.",
      urgency: "low",
      status: "rejected",
      requested_by: "Manager Tom",
      requested_at: "2024-12-17T13:45:00Z",
      reviewed_by: "Admin Kumar",
      reviewed_at: "2024-12-17T15:20:00Z",
      review_notes: "Rejected. Current stock is sufficient for 2 months. Bulk purchase not justified at this time due to budget constraints."
    },
    {
      id: "5",
      medicine_name: "Glycomet 500",
      current_stock: 45,
      requested_quantity: 400,
      reason: "Diabetes medication with consistent demand. Stock levels are below optimal threshold for this high-turnover medicine.",
      urgency: "medium",
      status: "pending",
      requested_by: "Manager Lisa",
      requested_at: "2024-12-19T16:30:00Z"
    },
    {
      id: "6",
      medicine_name: "Crocin Advance",
      current_stock: 12,
      requested_quantity: 600,
      reason: "Children's fever medicine in high demand. Parents are frequently asking for this specific brand. Stock critically low.",
      urgency: "high",
      status: "pending",
      requested_by: "Manager John",
      requested_at: "2024-12-20T08:15:00Z"
    },
    {
      id: "7",
      medicine_name: "Telma 40",
      current_stock: 18,
      requested_quantity: 150,
      reason: "Hypertension medication for regular patients. Several patients have standing prescriptions for this medicine.",
      urgency: "medium",
      status: "approved",
      requested_by: "Manager Sarah",
      requested_at: "2024-12-18T11:45:00Z",
      reviewed_by: "Admin Priya",
      reviewed_at: "2024-12-18T14:20:00Z",
      review_notes: "Approved. Regular prescription medicine. Order confirmed with supplier."
    },
    {
      id: "8",
      medicine_name: "Allegra 120",
      current_stock: 6,
      requested_quantity: 100,
      reason: "Allergy medication demand increased due to air pollution and seasonal allergies. Stock will be exhausted soon.",
      urgency: "high",
      status: "pending",
      requested_by: "Manager Mike",
      requested_at: "2024-12-20T12:00:00Z"
    }
  ])
  const [loading, setLoading] = useState(false)
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  // New request form state
  const [selectedMedicine, setSelectedMedicine] = useState('')
  const [requestedQuantity, setRequestedQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/low-stock-requests')
      const data = await response.json()
      if (data.requests && data.requests.length > 0) {
        setRequests(data.requests)
      }
      // If no data from API, keep static data
    } catch (error) {
      console.log('Using static demo data - API not available:', error)
      // Keep static data
    } finally {
      setLoading(false)
    }
  }

  const submitRequest = async () => {
    if (!selectedMedicine || !requestedQuantity || !reason) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/low-stock-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicine_id: selectedMedicine,
          requested_quantity: parseInt(requestedQuantity),
          reason,
          urgency
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Low stock request submitted successfully!')
        setShowNewRequestDialog(false)
        resetForm()
        fetchRequests()
      } else {
        alert(data.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedMedicine('')
    setRequestedQuantity('')
    setReason('')
    setUrgency('medium')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true
    return request.status === filterStatus
  })

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  if (loading) {
    return (
      <DashboardLayout role="manager">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Low Stock Requests</h1>
            <p className="text-muted-foreground">Submit and track low stock replenishment requests</p>
          </div>
          <Button onClick={() => setShowNewRequestDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.medicine_name}</CardTitle>
                    <CardDescription>
                      Requested by {request.requested_by} • {new Date(request.requested_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-lg font-bold text-red-600">{request.current_stock} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Quantity</p>
                    <p className="text-lg font-bold text-blue-600">{request.requested_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Urgency Level</p>
                    <p className="text-lg font-bold capitalize">{request.urgency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-bold capitalize">{request.status}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{request.reason}</p>
                </div>

                {request.status !== 'pending' && request.review_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Review Notes</p>
                    <div className={`text-sm p-3 rounded ${
                      request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <p>{request.review_notes}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed by {request.reviewed_by} on {new Date(request.reviewed_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No requests found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or create a new request</p>
          </div>
        )}

        {/* New Request Dialog */}
        <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Low Stock Request</DialogTitle>
              <DialogDescription>
                Request replenishment for medicines running low on stock
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Medicine</label>
                <Input
                  placeholder="Enter medicine name or ID"
                  value={selectedMedicine}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMedicine(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Requested Quantity</label>
                <Input
                  type="number"
                  placeholder="Enter quantity needed"
                  value={requestedQuantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestedQuantity(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Urgency Level</label>
                <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  placeholder="Explain why this stock replenishment is needed..."
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                  rows={4}
                />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your request will be reviewed by the admin team. You'll be notified once it's approved or rejected.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={submitRequest} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}