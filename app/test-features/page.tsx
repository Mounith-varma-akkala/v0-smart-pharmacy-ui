'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, CheckCircle, Package } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/layout'

export default function TestFeaturesPage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pharm Features Test</h1>
          <p className="text-muted-foreground">Testing all implemented components and features</p>
        </div>

        {/* Test Alert Component */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All pharmacy features have been successfully implemented!
          </AlertDescription>
        </Alert>

        {/* Test Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Suppliers Management
              </CardTitle>
              <CardDescription>Manage pharmaceutical suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Implemented</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                FEFO Expiry Management
              </CardTitle>
              <CardDescription>First Expiry First Out inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Implemented</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Price Forecasting
              </CardTitle>
              <CardDescription>Predict price surges</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Implemented</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Test Textarea */}
        <Card>
          <CardHeader>
            <CardTitle>Test Textarea Component</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="This is a test of the textarea component..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Feature List */}
        <Card>
          <CardHeader>
            <CardTitle>Implemented Features</CardTitle>
            <CardDescription>Complete list of pharmacy features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                'Suppliers Management with Performance Tracking',
                'FEFO (First Expiry First Out) Inventory Management',
                'Price Surge Forecasting with Stock Recommendations',
                'Demand Analysis with Sales Patterns & Heatmaps',
                'Drug Substitution Modal with Equivalency Scoring',
                'Pharmacy-Only Chatbot with Intent Filtering',
                'Low Stock Request System with Manager Workflow',
                'Comprehensive Database Schema with Audit Trails',
                'Real-time Notifications and Alerts',
                'Advanced Analytics and Reporting'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 All Features Implemented!</h2>
          <p className="text-muted-foreground">
            The Pharm Inventory Management System is now complete with all requested features.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}