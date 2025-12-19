"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, Package, AlertCircle } from "lucide-react"

export default function ForecastingPage() {
  const [selectedMedicine, setSelectedMedicine] = useState("paracetamol")
  const [timeframe, setTimeframe] = useState("30")

  const forecastData = [
    { day: "Day 1", predicted: 45, actual: 42, confidence: [40, 50] },
    { day: "Day 3", predicted: 52, actual: 50, confidence: [47, 57] },
    { day: "Day 5", predicted: 48, actual: 45, confidence: [43, 53] },
    { day: "Day 7", predicted: 61, actual: 58, confidence: [56, 66] },
    { day: "Day 10", predicted: 55, actual: null, confidence: [50, 60] },
    { day: "Day 14", predicted: 58, actual: null, confidence: [53, 63] },
    { day: "Day 21", predicted: 64, actual: null, confidence: [59, 69] },
    { day: "Day 30", predicted: 70, actual: null, confidence: [65, 75] },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Demand Forecasting</h1>
          <p className="text-muted-foreground">Predict future demand with machine learning to optimize stock levels</p>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <label className="text-sm font-medium mb-2 block">Select Medicine</label>
            <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paracetamol">Paracetamol 500mg</SelectItem>
                <SelectItem value="amoxicillin">Amoxicillin 250mg</SelectItem>
                <SelectItem value="ibuprofen">Ibuprofen 400mg</SelectItem>
                <SelectItem value="metformin">Metformin 500mg</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4">
            <label className="text-sm font-medium mb-2 block">Forecast Timeline</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Reorder Recommendation</span>
            </div>
            <p className="text-2xl font-bold text-primary">In 12 Days</p>
          </Card>
        </div>

        {/* Forecast Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Predicted vs Actual Demand</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0081FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0081FF" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="confidence"
                stroke="none"
                fill="url(#confidenceGradient)"
                name="Confidence Range"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#0081FF"
                strokeWidth={3}
                dot={{ fill: "#0081FF", r: 5 }}
                name="Predicted Demand"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", r: 5 }}
                name="Actual Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Insights */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold">Accuracy Score</h4>
            </div>
            <p className="text-3xl font-bold">94.2%</p>
            <p className="text-sm text-muted-foreground mt-1">Last 30 days prediction accuracy</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Package className="w-5 h-5 text-success" />
              </div>
              <h4 className="font-semibold">Optimal Stock</h4>
            </div>
            <p className="text-3xl font-bold">850 Units</p>
            <p className="text-sm text-muted-foreground mt-1">Recommended inventory level</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <h4 className="font-semibold">Wastage Prevented</h4>
            </div>
            <p className="text-3xl font-bold">$12,450</p>
            <p className="text-sm text-muted-foreground mt-1">Saved this month through AI forecasting</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
