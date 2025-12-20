"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, ShoppingCart, DollarSign, Users, Activity, Zap } from "lucide-react"
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
  AreaChart,
  Area,
} from "recharts"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMedicines: 247,
    soldToday: 156,
    remainingStock: 12847,
    expiringSoon: 23,
    totalRevenue: 45680.50,
    totalTransactions: 89,
    averageSale: 513.25,
    uniqueCustomers: 67,
  })

  const [salesData, setSalesData] = useState([
    { month: 'Dec 14', sales: 4200, inventory: 12847 },
    { month: 'Dec 15', sales: 3800, inventory: 12847 },
    { month: 'Dec 16', sales: 5100, inventory: 12847 },
    { month: 'Dec 17', sales: 4600, inventory: 12847 },
    { month: 'Dec 18', sales: 5800, inventory: 12847 },
    { month: 'Dec 19', sales: 6200, inventory: 12847 },
    { month: 'Dec 20', sales: 7100, inventory: 12847 },
  ])

  const [topMedicines, setTopMedicines] = useState([
    { medicine_name: 'Dolo 650', total_sold: 45, revenue: 1125 },
    { medicine_name: 'Azithral 500', total_sold: 32, revenue: 3040 },
    { medicine_name: 'Pan 40', total_sold: 28, revenue: 3360 },
    { medicine_name: 'Crocin Advance', total_sold: 38, revenue: 836 },
    { medicine_name: 'Glycomet 500', total_sold: 41, revenue: 738 },
  ])

  const [paymentMethods, setPaymentMethods] = useState([
    { payment_method: 'Cash', transaction_count: 42, revenue: 18500 },
    { payment_method: 'Card', transaction_count: 28, revenue: 15200 },
    { payment_method: 'UPI', transaction_count: 15, revenue: 8900 },
    { payment_method: 'Insurance', transaction_count: 4, revenue: 3080 },
  ])

  const [salesTrend, setSalesTrend] = useState([
    { sale_day: '2024-12-14', transactions: 23, revenue: 4200, units_sold: 67 },
    { sale_day: '2024-12-15', transactions: 19, revenue: 3800, units_sold: 54 },
    { sale_day: '2024-12-16', transactions: 31, revenue: 5100, units_sold: 89 },
    { sale_day: '2024-12-17', transactions: 26, revenue: 4600, units_sold: 72 },
    { sale_day: '2024-12-18', transactions: 34, revenue: 5800, units_sold: 98 },
    { sale_day: '2024-12-19', transactions: 38, revenue: 6200, units_sold: 112 },
    { sale_day: '2024-12-20', transactions: 42, revenue: 7100, units_sold: 156 },
  ])

  const [loading, setLoading] = useState(false) // Set to false to show static data immediately

  const [categoryData, setCategoryData] = useState([
    { category: "Pain Relief", stock: 3420 },
    { category: "Antibiotics", stock: 2180 },
    { category: "Gastric", stock: 1890 },
    { category: "Diabetes", stock: 1650 },
    { category: "Vitamins", stock: 2340 },
    { category: "Hypertension", stock: 1367 },
  ])

  const [expiryData, setExpiryData] = useState([
    { name: "Active", value: 224, color: "#10B981" },
    { name: "Expiring Soon", value: 23, color: "#F59E0B" },
    { name: "Expired", value: 0, color: "#EF4444" },
  ])

  useEffect(() => {
    const supabase = createClient()

    const fetchStats = async () => {
      try {
        // Try to fetch real data from Supabase
        const { count: totalCount } = await supabase.from("medicines").select("*", { count: "exact", head: true })

        // Only update if we actually get data from the database
        if (totalCount && totalCount > 0) {
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
                inventory: totalStock
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
              .slice(0, 6),
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
            { name: "Active", value: active, color: "#10B981" },
            { name: "Expiring Soon", value: expiringSoon, color: "#F59E0B" },
            { name: "Expired", value: expired, color: "#EF4444" },
          ])
        }
        // If no data in database, keep the static dummy data that's already set
      } catch (error) {
        console.log('Using static demo data - database not connected:', error)
        // Keep the static dummy data that's already initialized
      }
    }

    fetchStats()

    // Set up real-time updates only if we have a working database connection
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

    // Poll for updates every 30 seconds
    const pollInterval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => {
      supabase.removeChannel(medicinesChannel)
      supabase.removeChannel(salesChannel)
      clearInterval(pollInterval)
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <DashboardLayout role="admin">
      <motion.div 
        className="space-y-8 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-600">Real-time insights into your pharmacy operations</p>
        </motion.div>

        {/* Stats Cards Row 1 - Inventory */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Package} 
            title="Total Medicines" 
            value={stats.totalMedicines} 
            trend={`${stats.totalMedicines} items`} 
            trendUp 
            color="blue"
            delay={0}
          />
          <StatCard 
            icon={ShoppingCart} 
            title="Sold Today" 
            value={stats.soldToday} 
            trend={`${stats.totalTransactions} orders`} 
            trendUp 
            color="green"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            title="Remaining Stock"
            value={stats.remainingStock}
            trend={`${stats.remainingStock} units`}
            trendUp
            color="purple"
            delay={0.2}
          />
          <StatCard 
            icon={AlertTriangle} 
            title="Expiring Soon" 
            value={stats.expiringSoon} 
            trend="Critical" 
            alert 
            color="orange"
            delay={0.3}
          />
        </motion.div>

        {/* Stats Cards Row 2 - Sales & Revenue */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={DollarSign} 
            title="Today's Revenue" 
            value={Math.round(stats.totalRevenue)} 
            trend={`₹${stats.totalRevenue.toFixed(2)}`} 
            trendUp 
            isCurrency 
            color="emerald"
            delay={0}
          />
          <StatCard 
            icon={Activity} 
            title="Total Transactions" 
            value={stats.totalTransactions} 
            trend={`${stats.totalTransactions} sales`} 
            trendUp 
            color="cyan"
            delay={0.1}
          />
          <StatCard 
            icon={Zap} 
            title="Average Sale" 
            value={Math.round(stats.averageSale)} 
            trend={`₹${stats.averageSale.toFixed(2)}`} 
            trendUp 
            isCurrency 
            color="violet"
            delay={0.2}
          />
          <StatCard 
            icon={Users} 
            title="Unique Customers" 
            value={stats.uniqueCustomers} 
            trend={`${stats.uniqueCustomers} today`} 
            trendUp 
            color="rose"
            delay={0.3}
          />
        </motion.div>

        {/* Charts Row 1 */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
          {/* Sales Trend Area Chart */}
          <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-slate-800">Sales Revenue Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Revenue (₹)"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Selling Medicines Bar Chart */}
          <Card className="p-6 bg-gradient-to-br from-white to-green-50/30 border-green-200/50 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-slate-800">Top Selling Medicines (Today)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topMedicines.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="medicine_name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Bar dataKey="total_sold" name="Units Sold" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Charts Row 2 */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
          {/* Category-wise Stock Bar Chart */}
          <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 border-purple-200/50 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-slate-800">Category-wise Stock Levels</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Bar dataKey="stock" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Payment Methods Pie Chart */}
          <Card className="p-6 bg-gradient-to-br from-white to-orange-50/30 border-orange-200/50 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-slate-800">Payment Methods Distribution</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={paymentMethods.map((pm, idx) => ({
                    name: pm.payment_method,
                    value: pm.transaction_count,
                    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][idx % 4]
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
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Expiry Status Chart */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50/30 border-slate-200/50 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-slate-800">Stock Status Distribution</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={expiryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
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
        </motion.div>
      </motion.div>
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
  color = "blue",
  delay = 0,
}: {
  icon: any
  title: string
  value: number
  trend: string
  trendUp?: boolean
  alert?: boolean
  isCurrency?: boolean
  color?: string
  delay?: number
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    emerald: "from-emerald-500 to-emerald-600",
    cyan: "from-cyan-500 to-cyan-600",
    violet: "from-violet-500 to-violet-600",
    rose: "from-rose-500 to-rose-600",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="p-6 bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            alert 
              ? "bg-red-100 text-red-700" 
              : trendUp 
                ? "bg-green-100 text-green-700" 
                : "bg-yellow-100 text-yellow-700"
          }`}>
            {trend}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900">
            {isCurrency ? '₹' : ''}
            <AnimatedCounter value={value} />
          </p>
        </div>
      </Card>
    </motion.div>
  )
}