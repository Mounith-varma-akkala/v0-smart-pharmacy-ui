'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, XCircle, Clock, AlertTriangle, Package } from 'lucide-react'
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
}

export default function ReviewRequestsPage() {
  const [requests, setRequests] = useState<LowStockRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<LowStockRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/low-stock-requests?status=pending')
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const reviewRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!reviewNotes.trim()) {
      alert('Please provide review notes')
      return
    }

    setReviewing(true)
    try {
      const response = await fetch(`/api/low-stock-requests/${requestId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          review_notes: reviewNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Request ${action}d successfully!`)
        setSelectedRequest(null)
        setReviewNotes('')
        fetchPendingRequests()
      } else {
        alert(data.error || `Failed to ${action} request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      alert(`Failed to ${action} request`)
    } finally {
      setReviewing(false)
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
          <h1 className="text-3xl font-bold">Review Stock Requests</h1>
          <p className="text-muted-foreground">Review and approve/reject low stock replenishment requests</p>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              {requests.length} requests awaiting your review
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.medicine_name}</CardTitle>
                    <CardDescription>
                      Requested by {request.requested_by} • {new Date(request.requested_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getUrgencyColor(request.urgency)}>
                    {request.urgency.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-lg font-bold text-red-600">{request.current_stock} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Quantity</p>
                    <p className="text-lg font-bold text-blue-600">{request.requested_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock After Approval</p>
                    <p className="text-lg font-bold text-green-600">
                      {request.current_stock + request.requested_quantity} units
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{request.reason}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setSelectedRequest(request)}
                    className="flex-1"
                  >
                    Review Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground">No pending stock requests to review</p>
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Stock Request</DialogTitle>
              <DialogDescription>
                Review and approve or reject this low stock request
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Request Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedRequest.medicine_name}</CardTitle>
                    <CardDescription>
                      Requested by {selectedRequest.requested_by}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-lg font-bold text-red-600">{selectedRequest.current_stock} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requested Quantity</p>
                        <p className="text-lg font-bold text-blue-600">{selectedRequest.requested_quantity} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Urgency</p>
                        <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                          {selectedRequest.urgency.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Request Date</p>
                        <p className="font-medium">{new Date(selectedRequest.requested_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reason</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.reason}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Notes */}
                <div>
                  <label className="text-sm font-medium">Review Notes *</label>
                  <Textarea
                    placeholder="Provide your review comments..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedRequest(null)}
                    disabled={reviewing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => reviewRequest(selectedRequest.id, 'reject')}
                    disabled={reviewing || !reviewNotes.trim()}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {reviewing ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button 
                    onClick={() => reviewRequest(selectedRequest.id, 'approve')}
                    disabled={reviewing || !reviewNotes.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {reviewing ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}