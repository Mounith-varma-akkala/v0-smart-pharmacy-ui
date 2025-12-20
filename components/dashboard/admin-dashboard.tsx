"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, ShoppingCart, DollarSign } from "lucide-react"
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
    totalRevenue: 0,
    totalTransactions: 0,
    averageSale: 0,
    uniqueCustomers: 0,
  })

  const [salesData, setSalesData] = useState<Array<{ month: string; sales: number; inventory: number }>>([])
  const [topMedicines, setTopMedicines] = useState<Array<{ medicine_name: string; total_sold: number; revenue: number }>>([])
  const [paymentMethods, setPaymentMethods] = useState<Array<{ payment_method: string; transaction_count: number; revenue: number }>>([])
  const [salesTrend, setSalesTrend] = useState<Array<{ sale_day: string; transactions: number; revenue: number; units_sold: number }>>([])
  const [loading, setLoading] = useState(true)

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
      setLoading(true)
      try {
        // Fetch total medicines count
        const { count: totalCount } = await supabase.from("medicines").select("*", { count: "exact", head: true })

        // Fetch total stock quantity
        const { data: medicines } = await supabase.from("medicines").select("quantity")
        const totalStock = medicines?.reduce((sum, m) => sum + (m.quantity || 0), 0) || 0

        // Fetch today's sales stats from API
        const today = new Date().toISOString().split("T")[0]
        const salesStatsResponse = await fetch('/api/sales/stats?period=today')
        const salesStatsData = await salesStatsResponse.json()

        let soldToday = 0
        let totalRevenue = 0
        let totalTransactions = 0
        let averageSale = 0
        let uniqueCustomers = 0

        if (salesStatsData.success && salesStatsData.data) {
          const { summary, topMedicines: topMeds, paymentMethods: payMethods, salesTrend: trend } = salesStatsData.data
          soldToday = summary.total_units_sold || 0
          totalRevenue = summary.total_revenue || 0
          totalTransactions = summary.total_transactions || 0
          averageSale = summary.average_sale_value || 0
          uniqueCustomers = summary.unique_customers || 0

          // Set sales-related state
          setTopMedicines(topMeds || [])
          setPaymentMethods(payMethods || [])
          setSalesTrend(trend || [])

          // Transform sales trend for chart (last 7 days)
          if (trend && trend.length > 0) {
            const chartData = trend.slice(-7).map((day: any) => ({
              month: new Date(day.sale_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              sales: day.revenue,
              inventory: totalStock // Keep current stock level for reference
            }))
            setSalesData(chartData)
          }
        }

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
          totalRevenue,
          totalTransactions,
          averageSale,
          uniqueCustomers,
        })

        // Fetch category-wise stock
        const { data: allMedicines } = await supabase.from("medicines").select("category, quantity, expiry_date")
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
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up real-time updates for both medicines and sales
    const medicinesChannel = supabase
      .channel("medicines-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "medicines" }, () => {
        fetchStats()
      })
      .subscribe()

    const salesChannel = supabase
      .channel("sales-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => {
        fetchStats()
      })
      .subscribe()

    // Also poll for updates every 30 seconds
    const pollInterval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => {
      supabase.removeChannel(medicinesChannel)
      supabase.removeChannel(salesChannel)
      clearInterval(pollInterval)
    }
  }, [])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Stats Cards Row 1 - Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Package} title="Total Medicines" value={stats.totalMedicines} trend={`${stats.totalMedicines} items`} trendUp />
          <StatCard icon={ShoppingCart} title="Sold Today" value={stats.soldToday} trend={`${stats.totalTransactions} orders`} trendUp />
          <StatCard
            icon={TrendingUp}
            title="Remaining Stock"
            value={stats.remainingStock}
            trend={`${stats.remainingStock} units`}
            trendUp
          />
          <StatCard icon={AlertTriangle} title="Expiring Soon" value={stats.expiringSoon} trend="Critical" alert />
        </div>

        {/* Stats Cards Row 2 - Sales & Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={DollarSign} 
            title="Today's Revenue" 
            value={Math.round(stats.totalRevenue)} 
            trend={`₹${stats.totalRevenue.toFixed(2)}`} 
            trendUp 
            isCurrency 
          />
          <StatCard 
            icon={ShoppingCart} 
            title="Total Transactions" 
            value={stats.totalTransactions} 
            trend={`${stats.totalTransactions} sales`} 
            trendUp 
          />
          <StatCard 
            icon={TrendingUp} 
            title="Average Sale" 
            value={Math.round(stats.averageSale)} 
            trend={`₹${stats.averageSale.toFixed(2)}`} 
            trendUp 
            isCurrency 
          />
          <StatCard 
            icon={Package} 
            title="Unique Customers" 
            value={stats.uniqueCustomers} 
            trend={`${stats.uniqueCustomers} today`} 
            trendUp 
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sales Trend Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-normal mb-4">Sales Revenue Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {loading || salesData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {loading ? 'Loading sales data...' : 'No sales data available'}
                </div>
              ) : (
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
                    name="Revenue (₹)"
                    stroke="#0081FF"
                    strokeWidth={2}
                    dot={{ fill: "#0081FF", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Card>

          {/* Top Selling Medicines Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-normal mb-4">Top Selling Medicines (Today)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {loading || topMedicines.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {loading ? 'Loading top medicines...' : 'No sales data available'}
                </div>
              ) : (
                <BarChart data={topMedicines.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="medicine_name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="total_sold" name="Units Sold" fill="#0081FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
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
                <Bar dataKey="stock" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Payment Methods Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-normal mb-4">Payment Methods Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              {loading || paymentMethods.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {loading ? 'Loading payment data...' : 'No payment data available'}
                </div>
              ) : (
                <PieChart>
                  <Pie
                    data={paymentMethods.map((pm, idx) => ({
                      name: pm.payment_method,
                      value: pm.transaction_count,
                      color: ['#0081FF', '#10B981', '#FFA500', '#FF4444'][idx % 4]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethods.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#0081FF', '#10B981', '#FFA500', '#FF4444'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
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
  isCurrency = false,
}: {
  icon: any
  title: string
  value: number
  trend: string
  trendUp?: boolean
  alert?: boolean
  isCurrency?: boolean
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
            {isCurrency ? '₹' : ''}
            <AnimatedCounter value={value} />
          </p>
        </div>
      </Card>
    </motion.div>
  )
}