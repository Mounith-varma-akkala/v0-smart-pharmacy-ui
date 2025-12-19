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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMedicines: 5234,
    soldToday: 342,
    remainingStock: 48765,
    expiringSoon: 28,
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
    { category: "Antibiotics", stock: 8500 },
    { category: "Pain Relief", stock: 6200 },
    { category: "Vitamins", stock: 4800 },
    { category: "Cardiac", stock: 3200 },
    { category: "Diabetes", stock: 5400 },
  ])

  const [expiryData, setExpiryData] = useState([
    { name: "Active", value: 4850, color: "#0081FF" },
    { name: "Expiring Soon", value: 284, color: "#FFA500" },
    { name: "Expired", value: 100, color: "#FF4444" },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalMedicines: prev.totalMedicines + Math.floor(Math.random() * 3 - 1),
        soldToday: prev.soldToday + Math.floor(Math.random() * 2),
        remainingStock: prev.remainingStock - Math.floor(Math.random() * 5),
        expiringSoon: prev.expiringSoon + Math.floor(Math.random() * 2 - 1),
      }))
    }, 2000)

    return () => clearInterval(interval)
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
            <h3 className="text-lg font-semibold mb-4">Sales vs Inventory Trend</h3>
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
            <h3 className="text-lg font-semibold mb-4">Category-wise Stock Levels</h3>
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
          <h3 className="text-lg font-semibold mb-4">Stock Status Distribution</h3>
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
            className={`text-sm font-medium ${trendUp ? "text-success" : alert ? "text-destructive" : "text-warning"}`}
          >
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">
            <AnimatedCounter value={value} />
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
