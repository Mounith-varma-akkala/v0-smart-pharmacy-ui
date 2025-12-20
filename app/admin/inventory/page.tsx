"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Medicine {
  id: string
  name: string
  category: string
  quantity: number
  price: number
  expiry_date: string
  batch_number: string
  supplier: string
  reorder_level: number
}

export default function InventoryPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "1",
      name: "Dolo 650",
      category: "Pain Relief",
      quantity: 2500,
      price: 25.00,
      expiry_date: "2025-12-31",
      batch_number: "DL2024001",
      supplier: "Micro Labs",
      reorder_level: 100
    },
    {
      id: "2", 
      name: "Azithral 500",
      category: "Antibiotics",
      quantity: 800,
      price: 95.00,
      expiry_date: "2025-11-30",
      batch_number: "AZ2024002",
      supplier: "Alembic Pharma",
      reorder_level: 40
    },
    {
      id: "3",
      name: "Pan 40",
      category: "Gastric",
      quantity: 1200,
      price: 120.00,
      expiry_date: "2025-10-25",
      batch_number: "PN2024003",
      supplier: "Alkem Labs",
      reorder_level: 60
    },
    {
      id: "4",
      name: "Glycomet 500",
      category: "Diabetes",
      quantity: 3500,
      price: 18.00,
      expiry_date: "2025-12-31",
      batch_number: "GM2024004",
      supplier: "USV Ltd",
      reorder_level: 200
    },
    {
      id: "5",
      name: "Telma 40",
      category: "Hypertension",
      quantity: 1000,
      price: 180.00,
      expiry_date: "2025-09-20",
      batch_number: "TM2024005",
      supplier: "Glenmark",
      reorder_level: 50
    },
    {
      id: "6",
      name: "Allegra 120",
      category: "Antihistamine",
      quantity: 600,
      price: 160.00,
      expiry_date: "2025-08-15",
      batch_number: "AL2024006",
      supplier: "Sanofi",
      reorder_level: 30
    },
    {
      id: "7",
      name: "Crocin Advance",
      category: "Pain Relief",
      quantity: 3200,
      price: 22.00,
      expiry_date: "2025-07-10",
      batch_number: "CR2024007",
      supplier: "GSK",
      reorder_level: 150
    },
    {
      id: "8",
      name: "Combiflam",
      category: "Pain Relief",
      quantity: 1800,
      price: 35.00,
      expiry_date: "2025-06-05",
      batch_number: "CB2024008",
      supplier: "Sanofi",
      reorder_level: 80
    },
    {
      id: "9",
      name: "Becosules",
      category: "Vitamins",
      quantity: 1500,
      price: 45.00,
      expiry_date: "2025-05-30",
      batch_number: "BC2024009",
      supplier: "Pfizer",
      reorder_level: 75
    },
    {
      id: "10",
      name: "Omez 20",
      category: "Gastric",
      quantity: 1500,
      price: 85.00,
      expiry_date: "2025-04-25",
      batch_number: "OM2024010",
      supplier: "Dr. Reddys",
      reorder_level: 75
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    expiry_date: "",
    batch_number: "",
    supplier: "",
    reorder_level: 0,
  })

  // Fetch medicines from Supabase
  const fetchMedicines = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("medicines").select("*").order("name")

      if (error) {
        console.log('Using static demo data - database not connected:', error)
        // Keep static data
      } else if (data && data.length > 0) {
        setMedicines(data)
      }
    } catch (error) {
      console.log('Using static demo data:', error)
      // Keep static data
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchMedicines()

    // Set up real-time subscription
    const channel = supabase
      .channel("inventory-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "medicines" }, () => {
        fetchMedicines()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingMedicine) {
      // Update existing medicine
      const { error } = await supabase.from("medicines").update(formData).eq("id", editingMedicine.id)

      if (error) {
        toast({
          title: "Error updating medicine",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Medicine updated successfully",
        })
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      // Insert new medicine
      const { error } = await supabase.from("medicines").insert([formData])

      if (error) {
        toast({
          title: "Error adding medicine",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Medicine added successfully",
        })
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      const { error } = await supabase.from("medicines").delete().eq("id", id)

      if (error) {
        toast({
          title: "Error deleting medicine",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Medicine deleted successfully",
        })
      }
    }
  }

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name,
      category: medicine.category,
      quantity: medicine.quantity,
      price: medicine.price,
      expiry_date: medicine.expiry_date,
      batch_number: medicine.batch_number,
      supplier: medicine.supplier,
      reorder_level: medicine.reorder_level,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      expiry_date: "",
      batch_number: "",
      supplier: "",
      reorder_level: 0,
    })
    setEditingMedicine(null)
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal mb-2">Inventory Management</h1>
            <p className="text-muted-foreground font-light">
              Real-time medicine stock tracking with full CRUD operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchMedicines} variant="outline" className="font-normal bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="font-normal">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-normal">
                    {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="font-normal">
                        Medicine Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="font-light"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="font-normal">
                        Category
                      </Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="font-light"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity" className="font-normal">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        required
                        className="font-light"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price" className="font-normal">
                        Price ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                        className="font-light"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry_date" className="font-normal">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        required
                        className="font-light"
                      />
                    </div>
                    <div>
                      <Label htmlFor="batch_number" className="font-normal">
                        Batch Number
                      </Label>
                      <Input
                        id="batch_number"
                        value={formData.batch_number}
                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                        required
                        className="font-light"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier" className="font-normal">
                        Supplier
                      </Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        required
                        className="font-light"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reorder_level" className="font-normal">
                        Reorder Level
                      </Label>
                      <Input
                        id="reorder_level"
                        type="number"
                        value={formData.reorder_level}
                        onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
                        required
                        className="font-light"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="font-normal"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="font-normal">
                      {editingMedicine ? "Update" : "Add"} Medicine
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal">Name</TableHead>
                <TableHead className="font-normal">Category</TableHead>
                <TableHead className="font-normal">Quantity</TableHead>
                <TableHead className="font-normal">Price</TableHead>
                <TableHead className="font-normal">Expiry Date</TableHead>
                <TableHead className="font-normal">Batch No</TableHead>
                <TableHead className="font-normal">Supplier</TableHead>
                <TableHead className="font-normal">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 font-light">
                    Loading medicines...
                  </TableCell>
                </TableRow>
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 font-light">
                    No medicines found. Add your first medicine to get started.
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-normal">{medicine.name}</TableCell>
                    <TableCell className="font-light">{medicine.category}</TableCell>
                    <TableCell className="font-light">{medicine.quantity}</TableCell>
                    <TableCell className="font-light">${medicine.price}</TableCell>
                    <TableCell className="font-light">{medicine.expiry_date}</TableCell>
                    <TableCell className="font-mono text-sm font-light">{medicine.batch_number}</TableCell>
                    <TableCell className="font-light">{medicine.supplier}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(medicine)}
                          className="font-normal"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(medicine.id)}
                          className="font-normal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
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
