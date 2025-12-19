"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw, Package } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Medicine {
  id: string
  name: string
  category: string
  quantity: number
  price: number
  expiry_date: string
  batch_number: string
  supplier: string
}

export default function ManagerInventoryPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMedicines = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("medicines").select("*").order("name")

    if (error) {
      toast({
        title: "Error fetching medicines",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setMedicines(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchMedicines()

    // Real-time subscription
    const channel = supabase
      .channel("manager-inventory")
      .on("postgres_changes", { event: "*", schema: "public", table: "medicines" }, () => {
        fetchMedicines()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return (
        <Badge variant="destructive" className="font-normal">
          Out of Stock
        </Badge>
      )
    if (quantity < 50)
      return (
        <Badge variant="outline" className="text-warning font-normal">
          Low Stock
        </Badge>
      )
    return (
      <Badge variant="outline" className="text-success font-normal">
        In Stock
      </Badge>
    )
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal mb-2">Inventory (Read-Only)</h1>
            <p className="text-muted-foreground font-light">View current medicine stock levels</p>
          </div>
          <Button onClick={fetchMedicines} variant="outline" className="font-normal bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal">Name</TableHead>
                <TableHead className="font-normal">Category</TableHead>
                <TableHead className="font-normal">Quantity</TableHead>
                <TableHead className="font-normal">Status</TableHead>
                <TableHead className="font-normal">Price</TableHead>
                <TableHead className="font-normal">Expiry Date</TableHead>
                <TableHead className="font-normal">Batch No</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 font-light">
                    Loading medicines...
                  </TableCell>
                </TableRow>
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 font-light">
                    <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p>No medicines in inventory</p>
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-normal">{medicine.name}</TableCell>
                    <TableCell className="font-light">{medicine.category}</TableCell>
                    <TableCell className="font-light">{medicine.quantity}</TableCell>
                    <TableCell>{getStockStatus(medicine.quantity)}</TableCell>
                    <TableCell className="font-light">${medicine.price}</TableCell>
                    <TableCell className="font-light">{medicine.expiry_date}</TableCell>
                    <TableCell className="font-mono text-sm font-light">{medicine.batch_number}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  )
}
