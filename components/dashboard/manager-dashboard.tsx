"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    soldToday: 342,
    remainingStock: 48765,
    pendingAlerts: 5,
    salesTarget: 85,
  })

  const [salesData, setSalesData] = useState([
    { day: "Mon", sales: 420 },
    { day: "Tue", sales: 380 },
    { day: "Wed", sales: 510 },
    { day: "Thu", sales: 460 },
    { day: "Fri", sales: 580 },
    { day: "Sat", sales: 620 },
    { day: "Sun", sales: 340 },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        soldToday: prev.soldToday + Math.floor(Math.random() * 2),
        remainingStock: prev.remainingStock - Math.floor(Math.random() * 5),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <DashboardLayout role="manager">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">Monitor daily sales and inventory updates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="outline" className="text-success">
                +8%
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sold Today</p>
              <p className="text-3xl font-bold">
                <AnimatedCounter value={stats.soldToday} />
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining Stock</p>
              <p className="text-3xl font-bold">
                <AnimatedCounter value={stats.remainingStock} />
              </p>
            </div>
          </Card>

          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <Badge variant="destructive">New</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
              <p className="text-3xl font-bold text-destructive">{stats.pendingAlerts}</p>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sales Target</p>
              <p className="text-3xl font-bold text-primary">{stats.salesTarget}%</p>
            </div>
          </Card>
        </div>

        {/* Weekly Sales Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Sales Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#0081FF"
                strokeWidth={3}
                dot={{ fill: "#0081FF", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h4 className="font-semibold mb-2">View Alerts</h4>
            <p className="text-sm text-muted-foreground">Check pending alerts and notifications from admin</p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h4 className="font-semibold mb-2">Update Inventory</h4>
            <p className="text-sm text-muted-foreground">Confirm daily inventory updates and sales entries</p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h4 className="font-semibold mb-2">View Forecasts</h4>
            <p className="text-sm text-muted-foreground">Access AI-powered demand forecasting data</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
