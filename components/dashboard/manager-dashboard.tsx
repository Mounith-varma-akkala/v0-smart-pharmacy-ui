"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

export default function ManagerDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    soldToday: 0,
    remainingStock: 0,
    pendingAlerts: 0,
    salesTarget: 0,
  })

  const [salesData, setSalesData] = useState([
    { day: "Mon", sales: 0 },
    { day: "Tue", sales: 0 },
    { day: "Wed", sales: 0 },
    { day: "Thu", sales: 0 },
    { day: "Fri", sales: 0 },
    { day: "Sat", sales: 0 },
    { day: "Sun", sales: 0 },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch today's sales from Supabase
      const today = new Date().toISOString().split("T")[0]
      const { data: todaySales, error: salesError } = await supabase
        .from("sales")
        .select("quantity")
        .gte("sale_date", `${today}T00:00:00`)
        .lte("sale_date", `${today}T23:59:59`)

      if (salesError) {
        console.error('Error fetching sales data:', salesError)
      }

      const soldToday = todaySales?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0

      // Fetch total stock
      const { data: medicines } = await supabase.from("medicines").select("quantity")
      const totalStock = medicines?.reduce((sum, m) => sum + (m.quantity || 0), 0) || 0

      // Fetch pending alerts
      const { count: alertCount } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)

      setStats({
        soldToday,
        remainingStock: totalStock,
        pendingAlerts: alertCount || 0,
        salesTarget: 85,
      })
    }

    fetchStats()

    // Real-time subscription for sales, medicines, and alerts
    const channel = supabase
      .channel("manager-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => {
        console.log('Sales data changed, refreshing stats...')
        fetchStats()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "medicines" }, () => {
        console.log('Medicines data changed, refreshing stats...')
        fetchStats()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        console.log('Alerts data changed, refreshing stats...')
        fetchStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    }
  }, [])

  return (
    <DashboardLayout role="manager">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-normal mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground font-light">Monitor daily sales and inventory updates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="outline" className="text-success font-normal">
                +8%
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-light">Sold Today</p>
              <p className="text-3xl font-normal">
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
              <p className="text-sm text-muted-foreground font-light">Remaining Stock</p>
              <p className="text-3xl font-normal">
                <AnimatedCounter value={stats.remainingStock} />
              </p>
            </div>
          </Card>

          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              {stats.pendingAlerts > 0 && (
                <Badge variant="destructive" className="font-normal">
                  New
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-light">Pending Alerts</p>
              <p className="text-3xl font-normal text-destructive">{stats.pendingAlerts}</p>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-light">Sales Target</p>
              <p className="text-3xl font-normal text-primary">{stats.salesTarget}%</p>
            </div>
          </Card>
        </div>

        {/* Weekly Sales Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-normal mb-4">Weekly Sales Performance</h3>
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
      </div>
    </DashboardLayout>
  )
}
