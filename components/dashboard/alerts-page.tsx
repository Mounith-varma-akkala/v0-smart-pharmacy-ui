"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { AlertTriangle, CheckCircle, Clock, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Alert {
  id: number
  type: "low-stock" | "expiry" | "reorder" | "system"
  title: string
  message: string
  timestamp: string
  priority: "high" | "medium" | "low"
  read: boolean
}

export default function AlertsPage({ role }: { role: "admin" | "manager" }) {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "low-stock",
      title: "Low Stock Alert",
      message: "Paracetamol 500mg is below threshold (50 units remaining)",
      timestamp: "2 minutes ago",
      priority: "high",
      read: false,
    },
    {
      id: 2,
      type: "expiry",
      title: "Medicine Expiring Soon",
      message: "Amoxicillin 250mg (Batch BAT-2024-002) expires in 10 days",
      timestamp: "15 minutes ago",
      priority: "high",
      read: false,
    },
    {
      id: 3,
      type: "reorder",
      title: "Reorder Recommendation",
      message: "AI suggests reordering Ibuprofen 400mg in next 5 days",
      timestamp: "1 hour ago",
      priority: "medium",
      read: false,
    },
    {
      id: 4,
      type: "system",
      title: "System Update",
      message: "Real-time sync completed successfully",
      timestamp: "2 hours ago",
      priority: "low",
      read: true,
    },
  ])

  const markAsRead = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })))
  }

  const sendToManager = (alert: Alert) => {
    toast({
      title: "Email Sent to Manager",
      description: `${alert.title}: ${alert.message}`,
    })
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low-stock":
      case "expiry":
        return AlertTriangle
      case "reorder":
        return Clock
      default:
        return CheckCircle
    }
  }

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-destructive/50 bg-destructive/5"
      case "medium":
        return "border-warning/50 bg-warning/5"
      default:
        return "border-border bg-card"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive"
      case "medium":
        return "bg-warning/10 text-warning"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <DashboardLayout role={role}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal mb-2">Alerts & Notifications</h1>
            <p className="text-muted-foreground font-light">Real-time alerts for stock, expiry, and system events</p>
          </div>
          <Button onClick={markAllAsRead} variant="outline" className="font-normal bg-transparent">
            Mark All as Read
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1 font-light">Total Alerts</div>
            <div className="text-2xl font-normal">{alerts.length}</div>
          </Card>
          <Card className="p-4 border-destructive/20 bg-destructive/5">
            <div className="text-sm text-muted-foreground mb-1 font-light">High Priority</div>
            <div className="text-2xl font-normal text-destructive">
              {alerts.filter((a) => a.priority === "high").length}
            </div>
          </Card>
          <Card className="p-4 border-warning/20 bg-warning/5">
            <div className="text-sm text-muted-foreground mb-1 font-light">Medium Priority</div>
            <div className="text-2xl font-normal text-warning">
              {alerts.filter((a) => a.priority === "medium").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1 font-light">Unread</div>
            <div className="text-2xl font-normal">{alerts.filter((a) => !a.read).length}</div>
          </Card>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type)
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-6 ${getAlertColor(alert.priority)} ${!alert.read ? "border-l-4" : ""}`}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${alert.priority === "high" ? "bg-destructive/10" : alert.priority === "medium" ? "bg-warning/10" : "bg-muted"}`}
                    >
                      <Icon
                        className={`w-6 h-6 ${alert.priority === "high" ? "text-destructive" : alert.priority === "medium" ? "text-warning" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-normal text-lg">{alert.title}</h3>
                        <Badge className={getPriorityBadge(alert.priority)}>{alert.priority.toUpperCase()}</Badge>
                        {!alert.read && <Badge variant="default">NEW</Badge>}
                      </div>
                      <p className="text-muted-foreground mb-3 font-light">{alert.message}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-light">
                        <span>{alert.timestamp}</span>
                        {role === "admin" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => sendToManager(alert)}
                              className="font-normal"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Send to Manager
                            </Button>
                            {!alert.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(alert.id)}
                                className="font-normal"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark as Read
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
