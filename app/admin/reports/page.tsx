"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Package, DollarSign, AlertTriangle } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalSales: 0,
    stockValue: 0,
  })
  const [salesTrend, setSalesTrend] = useState<any[]>([])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch sales data from Supabase
        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("quantity, total_price, sale_date")
          .order("sale_date", { ascending: false })

        if (salesError) {
          console.error('Error fetching sales data:', salesError)
          throw salesError
        }

        const totalRevenue = sales?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0
        const totalSalesCount = sales?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0

        // Fetch inventory value from Supabase
        const { data: medicines } = await supabase.from("medicines").select("quantity, price")
        const stockValue = medicines?.reduce((sum, m) => sum + (m.quantity || 0) * (m.price || 0), 0) || 0

        setStats({
          totalRevenue,
          totalProfit: totalRevenue * 0.3, // Assuming 30% profit margin
          totalSales: totalSalesCount,
          stockValue,
        })

        // Process sales trend data for chart
        const trendMap = new Map()
        sales?.forEach((sale) => {
          const date = new Date(sale.sale_date).toLocaleDateString()
          trendMap.set(date, (trendMap.get(date) || 0) + (sale.total_price || 0))
        })

        const chartData = Array.from(trendMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .slice(0, 7) // Last 7 days
          .reverse()

        setSalesTrend(chartData)

      } catch (error) {
        console.error('Error fetching reports data:', error)
        // Set default values on error
        setStats({
          totalRevenue: 0,
          totalProfit: 0,
          totalSales: 0,
          stockValue: 0,
        })
        setSalesTrend([])
      }

      setSalesTrend(
        Array.from(trendMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .slice(0, 7)
          .reverse(),
      )
    }

    fetchReports()

    // Real-time updates
    const channel = supabase
      .channel("reports-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => {
        fetchReports()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const exportReport = () => {
    toast({
      title: "Exporting Report",
      description: "Your comprehensive analytics report is being generated...",
    })
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground font-light">Comprehensive business intelligence and insights</p>
          </div>
          <Button onClick={exportReport} className="font-normal">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-normal text-sm">Total Revenue</h4>
            </div>
            <p className="text-3xl font-normal">${stats.totalRevenue.toFixed(2)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h4 className="font-normal text-sm">Total Profit</h4>
            </div>
            <p className="text-3xl font-normal text-success">${stats.totalProfit.toFixed(2)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Package className="w-5 h-5 text-warning" />
              </div>
              <h4 className="font-normal text-sm">Total Sales</h4>
            </div>
            <p className="text-3xl font-normal">{stats.totalSales} units</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-normal text-sm">Stock Value</h4>
            </div>
            <p className="text-3xl font-normal">${stats.stockValue.toFixed(2)}</p>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-normal mb-4">7-Day Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
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
                dataKey="revenue"
                stroke="#0081FF"
                strokeWidth={3}
                dot={{ fill: "#0081FF", r: 5 }}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  )
}
