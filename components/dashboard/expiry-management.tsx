"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Mail, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Medicine {
  id: number
  name: string
  batchNo: string
  expiryDate: string
  daysLeft: number
  quantity: number
  status: "critical" | "warning" | "safe"
}

export default function ExpiryManagement() {
  const { toast } = useToast()
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: 1,
      name: "Paracetamol 500mg",
      batchNo: "BAT-2024-001",
      expiryDate: "2024-12-25",
      daysLeft: 5,
      quantity: 250,
      status: "critical",
    },
    {
      id: 2,
      name: "Amoxicillin 250mg",
      batchNo: "BAT-2024-002",
      expiryDate: "2024-12-30",
      daysLeft: 10,
      quantity: 180,
      status: "warning",
    },
    {
      id: 3,
      name: "Ibuprofen 400mg",
      batchNo: "BAT-2024-003",
      expiryDate: "2025-01-15",
      daysLeft: 26,
      quantity: 420,
      status: "warning",
    },
    {
      id: 4,
      name: "Metformin 500mg",
      batchNo: "BAT-2024-004",
      expiryDate: "2025-02-20",
      daysLeft: 62,
      quantity: 340,
      status: "safe",
    },
    {
      id: 5,
      name: "Atorvastatin 10mg",
      batchNo: "BAT-2024-005",
      expiryDate: "2024-12-28",
      daysLeft: 8,
      quantity: 160,
      status: "critical",
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMedicines((prev) =>
        prev.map((med) => ({
          ...med,
          daysLeft: Math.max(0, med.daysLeft - 0.01),
        })),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "warning":
        return "bg-warning/10 text-warning border-warning/20"
      default:
        return "bg-success/10 text-success border-success/20"
    }
  }

  const notifyManager = (medicine: Medicine) => {
    toast({
      title: "Manager Notified",
      description: `Email notification sent about ${medicine.name} (${medicine.batchNo})`,
    })
  }

  const triggerReorder = (medicine: Medicine) => {
    toast({
      title: "Reorder Triggered",
      description: `Purchase order initiated for ${medicine.name}`,
    })
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-normal mb-2">Expiry Management</h1>
          <p className="text-muted-foreground font-light">
            FEFO (First Expired, First Out) logic for optimal inventory management
          </p>
        </div>

        {/* Alert Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-destructive animate-pulse-glow" />
              <h4 className="font-normal">Critical ( {"<"}10 days)</h4>
            </div>
            <p className="text-3xl font-normal text-destructive">
              {medicines.filter((m) => m.status === "critical").length}
            </p>
          </Card>

          <Card className="p-6 border-warning/20 bg-warning/5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <h4 className="font-normal">Warning (10-30 days)</h4>
            </div>
            <p className="text-3xl font-normal text-warning">
              {medicines.filter((m) => m.status === "warning").length}
            </p>
          </Card>

          <Card className="p-6 border-success/20 bg-success/5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-success" />
              <h4 className="font-normal">Safe ({">"}30 days)</h4>
            </div>
            <p className="text-3xl font-normal text-success">{medicines.filter((m) => m.status === "safe").length}</p>
          </Card>
        </div>

        {/* Expiry Table */}
        <Card>
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-normal">Medicine Expiry List (FEFO Order)</h3>
            <Button variant="outline" size="sm" className="font-normal bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal">Medicine Name</TableHead>
                <TableHead className="font-normal">Batch No</TableHead>
                <TableHead className="font-normal">Expiry Date</TableHead>
                <TableHead className="font-normal">Days Left</TableHead>
                <TableHead className="font-normal">Quantity</TableHead>
                <TableHead className="font-normal">Status</TableHead>
                <TableHead className="font-normal">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines
                .sort((a, b) => a.daysLeft - b.daysLeft)
                .map((medicine, index) => (
                  <motion.tr
                    key={medicine.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={medicine.status === "critical" ? "animate-pulse-glow" : ""}
                  >
                    <TableCell className="font-normal">{medicine.name}</TableCell>
                    <TableCell className="font-mono text-sm font-light">{medicine.batchNo}</TableCell>
                    <TableCell className="font-light">{medicine.expiryDate}</TableCell>
                    <TableCell>
                      <span className={medicine.daysLeft < 10 ? "text-destructive font-normal" : "font-light"}>
                        {Math.floor(medicine.daysLeft)} days
                      </span>
                    </TableCell>
                    <TableCell className="font-light">{medicine.quantity} units</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(medicine.status)}>{medicine.status.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => notifyManager(medicine)}
                          className="font-normal"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Notify
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => triggerReorder(medicine)}
                          className="font-normal"
                        >
                          Reorder
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  )
}
