"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingDown, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface PriceComparison {
  id: string
  medicine_name: string
  supplier: string
  supplier_price: number
  selling_price: number
  discount: number
  is_best_deal: boolean
}

export default function PriceComparisonPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [prices, setPrices] = useState<PriceComparison[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMedicine, setSelectedMedicine] = useState<string>("")

  const fetchPrices = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("price_comparisons").select("*").order("medicine_name")

    if (error) {
      toast({
        title: "Error fetching prices",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setPrices(data || [])
      if (data && data.length > 0) {
        setSelectedMedicine(data[0].medicine_name)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPrices()

    // Real-time subscription
    const channel = supabase
      .channel("price-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "price_comparisons" }, () => {
        fetchPrices()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const medicineNames = Array.from(new Set(prices.map((p) => p.medicine_name)))
  const filteredPrices = prices.filter((p) => p.medicine_name === selectedMedicine)

  const chartData = filteredPrices.map((p) => ({
    supplier: p.supplier,
    supplierPrice: p.supplier_price,
    sellingPrice: p.selling_price,
  }))

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal mb-2">Price Comparison</h1>
            <p className="text-muted-foreground font-light">
              Compare prices from Amazon Pharma, Apollo, Mankind, Cipla, and Sun Pharma
            </p>
          </div>
          <Button onClick={fetchPrices} variant="outline" className="font-normal bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Prices
          </Button>
        </div>

        {/* Medicine Selection */}
        <div className="flex gap-2 flex-wrap">
          {medicineNames.map((name) => (
            <Button
              key={name}
              variant={selectedMedicine === name ? "default" : "outline"}
              onClick={() => setSelectedMedicine(name)}
              className="font-normal"
            >
              {name}
            </Button>
          ))}
        </div>

        {/* Price Chart */}
        {chartData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-normal mb-4">Price Comparison Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="supplier" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="supplierPrice" fill="#0081FF" name="Supplier Price" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sellingPrice" fill="#10B981" name="Selling Price" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Price Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <Card className="p-6 col-span-3 text-center font-light">Loading prices...</Card>
          ) : filteredPrices.length === 0 ? (
            <Card className="p-6 col-span-3 text-center font-light">No price data available for this medicine</Card>
          ) : (
            filteredPrices.map((price, index) => (
              <motion.div
                key={price.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`p-6 ${price.is_best_deal ? "border-2 border-primary bg-primary/5" : ""} hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-normal text-lg">{price.supplier}</h3>
                    </div>
                    {price.is_best_deal && <Badge className="bg-primary font-normal">Best Deal</Badge>}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground font-light">Supplier Price</p>
                      <p className="text-2xl font-normal">${price.supplier_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-light">Selling Price</p>
                      <p className="text-2xl font-normal text-success">${price.selling_price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-success" />
                      <span className="text-sm font-normal text-success">{price.discount}% discount</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
