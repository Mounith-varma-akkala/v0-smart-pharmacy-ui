"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, ShoppingCart } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    soldToday: 0,
    remainingStock: 0,
    expiringSoon: 0,
  })

  const [salesData, setSalesData] = useState([
    { month: "Jan", sales: 4200, inventory: 15000 },
    { month: "Feb", sales: 3800, inventory: 14200 },
    { month: "Mar", sales: 5100, inventory: 16800 },
    { month: "Apr", sales: 4600, inventory: 15400 },
    { month: "May", sales: 5800, inventory: 17200 },
    { month: "Jun", sales: 6200, inventory: 18500 },
  ])

  const [categoryData, setCategoryData] = useState([
    { category: "Antibiotics", stock: 0 },
    { category: "Pain Relief", stock: 0 },
    { category: "Vitamins", stock: 0 },
    { category: "Cardiac", stock: 0 },
    { category: "Diabetes", stock: 0 },
  ])

  const [expiryData, setExpiryData] = useState([
    { name: "Active", value: 0, color: "#0081FF" },
    { name: "Expiring Soon", value: 0, color: "#FFA500" },
    { name: "Expired", value: 0, color: "#FF4444" },
  ])

  useEffect(() => {
    const supabase = createClient()

    const fetchStats = async () => {
      // Fetch total medicines count
      const { count: totalCount } = await supabase.from("medicines").select("*", { count: "exact", head: true })

      // Fetch total stock quantity
      const { data: medicines } = await supabase.from("medicines").select("quantity")
      const totalStock = medicines?.reduce((sum, m) => sum + (m.quantity || 0), 0) || 0

      // Fetch today's sales
      const today = new Date().toISOString().split("T")[0]
      const { data: todaySales } = await supabase.from("sales").select("quantity").gte("sale_date", `${today}T00:00:00`)
      const soldToday = todaySales?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0

      // Fetch expiring soon medicines (within 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      const { count: expiringCount } = await supabase
        .from("medicines")
        .select("*", { count: "exact", head: true })
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
        .gte("expiry_date", today)

      setStats({
        totalMedicines: totalCount || 0,
        soldToday,
        remainingStock: totalStock,
        expiringSoon: expiringCount || 0,
      })

      // Fetch category-wise stock
      const { data: allMedicines } = await supabase.from("medicines").select("category, quantity")
      const categoryMap = new Map<string, number>()
      allMedicines?.forEach((med) => {
        const cat = med.category || "Other"
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + (med.quantity || 0))
      })

      setCategoryData(
        Array.from(categoryMap.entries())
          .map(([category, stock]) => ({ category, stock }))
          .slice(0, 5),
      )

      // Calculate expiry distribution
      const now = new Date()
      const expired = allMedicines?.filter((m) => new Date(m.expiry_date || "") < now).length || 0
      const expiringSoon =
        allMedicines?.filter((m) => {
          const exp = new Date(m.expiry_date || "")
          return exp >= now && exp <= thirtyDaysFromNow
        }).length || 0
      const active = (allMedicines?.length || 0) - expired - expiringSoon

      setExpiryData([
        { name: "Active", value: active, color: "#0081FF" },
        { name: "Expiring Soon", value: expiringSoon, color: "#FFA500" },
        { name: "Expired", value: expired, color: "#FF4444" },
      ])
    }

    fetchStats()

    const channel = supabase
      .channel("medicines-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "medicines" }, () => {
        fetchStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Package} title="Total Medicines" value={stats.totalMedicines} trend="+12%" trendUp />
          <StatCard icon={ShoppingCart} title="Sold Today" value={stats.soldToday} trend="+8%" trendUp />
          <StatCard
            icon={TrendingUp}
            title="Remaining Stock"
            value={stats.remainingStock}
            trend="-3%"
            trendUp={false}
          />
          <StatCard icon={AlertTriangle} title="Expiring Soon" value={stats.expiringSoon} trend="Critical" alert />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sales vs Inventory Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-normal mb-4">Sales vs Inventory Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                  strokeWidth={2}
                  dot={{ fill: "#0081FF", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="inventory"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category-wise Stock Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-normal mb-4">Category-wise Stock Levels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="stock" fill="#0081FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Expiry Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-normal mb-4">Stock Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expiryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {expiryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  trend,
  trendUp = true,
  alert = false,
}: {
  icon: any
  title: string
  value: number
  trend: string
  trendUp?: boolean
  alert?: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${alert ? "bg-destructive/10" : "bg-primary/10"}`}>
            <Icon className={`w-6 h-6 ${alert ? "text-destructive" : "text-primary"}`} />
          </div>
          <div
            className={`text-sm font-normal ${trendUp ? "text-success" : alert ? "text-destructive" : "text-warning"}`}
          >
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-light">{title}</p>
          <p className="text-3xl font-normal">
            <AnimatedCounter value={value} />
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
