"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Upload, FileCheck, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CheckResult {
  medicine: string
  available: boolean
  quantity: number
  batch?: string
}

export default function PrescriptionCheck() {
  const { toast } = useToast()
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<CheckResult[] | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      // Simulate OCR/prescription parsing - in production this would call an AI service
      const mockPrescriptionMedicines = [
        "Paracetamol 500mg",
        "Amoxicillin 250mg",
        "Vitamin D3 1000IU",
        "Omeprazole 20mg",
      ]

      // Check availability in Supabase
      const checkResults: CheckResult[] = []

      for (const medicineName of mockPrescriptionMedicines) {
        const { data: medicines } = await supabase
          .from("medicines")
          .select("name, quantity, batch_number")
          .ilike("name", `%${medicineName.split(" ")[0]}%`)
          .limit(1)

        if (medicines && medicines.length > 0) {
          const med = medicines[0]
          checkResults.push({
            medicine: medicineName,
            available: (med.quantity || 0) > 0,
            quantity: med.quantity || 0,
            batch: med.batch_number,
          })
        } else {
          checkResults.push({
            medicine: medicineName,
            available: false,
            quantity: 0,
          })
        }
      }

      // Save prescription check to database
      await supabase.from("prescriptions").insert({
        customer_name: "Walk-in Customer",
        customer_email: "customer@example.com",
        medicines_requested: mockPrescriptionMedicines,
        availability_status: checkResults,
        file_url: URL.createObjectURL(file),
      })

      setResults(checkResults)
      toast({
        title: "Prescription checked successfully",
        description: `Found ${checkResults.filter((r) => r.available).length} of ${checkResults.length} medicines in stock`,
      })
    } catch (error: any) {
      toast({
        title: "Error checking prescription",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-normal mb-2">Customer Prescription Check</h1>
          <p className="text-muted-foreground font-light">
            Upload prescription to verify medicine availability in inventory
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-normal mb-2">Upload Prescription</h3>
            <p className="text-muted-foreground font-light mb-6">Support for image (JPG, PNG) and PDF files</p>
            <label htmlFor="prescription-upload">
              <Button asChild disabled={uploading} className="font-normal">
                <span className="cursor-pointer">{uploading ? "Processing..." : "Choose File"}</span>
              </Button>
            </label>
            <input
              id="prescription-upload"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        </Card>

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-normal">Availability Check Results</h2>
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 border-success/20 bg-success/5">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <h4 className="font-normal">Available Medicines</h4>
                </div>
                <p className="text-3xl font-normal text-success">{results.filter((r) => r.available).length}</p>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-6 h-6 text-destructive" />
                  <h4 className="font-normal">Out of Stock</h4>
                </div>
                <p className="text-3xl font-normal text-destructive">{results.filter((r) => !r.available).length}</p>
              </Card>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 ${result.available ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {result.available ? (
                          <CheckCircle className="w-8 h-8 text-success" />
                        ) : (
                          <XCircle className="w-8 h-8 text-destructive" />
                        )}
                        <div>
                          <h4 className="font-normal text-lg">{result.medicine}</h4>
                          {result.available ? (
                            <p className="text-sm text-muted-foreground font-light">
                              {result.quantity} units available • Batch: {result.batch}
                            </p>
                          ) : (
                            <p className="text-sm text-destructive font-light">Out of stock</p>
                          )}
                        </div>
                      </div>
                      {result.available && <Button className="font-normal">Add to Order</Button>}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setResults(null)} className="font-normal bg-transparent">
                Check Another Prescription
              </Button>
              <Button className="font-normal">Generate Customer Quote</Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
