'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, XCircle, Upload, FileText, AlertTriangle, Database } from 'lucide-react'

export default function ImportJsonDataPage() {
  const [jsonData, setJsonData] = useState('')
  const [dataType, setDataType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const dataTypes = [
    { value: 'sales', label: 'Sales Data', description: 'Transaction records, sales history' },
    { value: 'medicines', label: 'Medicines/Inventory', description: 'Drug information, stock levels' },
    { value: 'purchases', label: 'Purchases', description: 'Purchase orders, inventory updates' },
    { value: 'suppliers', label: 'Suppliers', description: 'Supplier contact information' }
  ]

  const sampleFormats = {
    sales: `[
  {
    "Transaction_ID": 1,
    "Date": "2025-12-01",
    "Drug_Name": "Paracetamol",
    "Qty_Sold": 10,
    "Unit_Price": 5.00,
    "Total_Amount": 50.00,
    "Payment_Method": "cash",
    "Customer_Name": "John Doe",
    "Customer_Phone": "+91-9876543210"
  }
]`,
    medicines: `[
  {
    "Drug_Name": "Paracetamol 500mg",
    "Generic_Name": "Paracetamol",
    "Category": "Pain Relief",
    "Unit_Price": 5.00,
    "Cost_Price": 3.50,
    "Quantity": 100,
    "Expiry_Date": "2025-12-31",
    "Manufacturer": "GSK"
  }
]`,
    purchases: `[
  {
    "Drug_Name": "Amoxicillin",
    "Quantity": 50,
    "Unit_Cost": 10.00,
    "Selling_Price": 15.00,
    "Supplier": "MediSupply Co.",
    "Expiry_Date": "2025-06-30"
  }
]`,
    suppliers: `[
  {
    "Supplier_Name": "MediSupply Co.",
    "Contact_Person": "Rajesh Kumar",
    "Email": "contact@medisupply.com",
    "Phone": "+91-9876543213",
    "Address": "123 Medical Street",
    "City": "Mumbai",
    "State": "Maharashtra"
  }
]`
  }

  const importJsonData = async () => {
    if (!jsonData.trim()) {
      setError('Please enter JSON data')
      return
    }

    if (!dataType) {
      setError('Please select data type')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const parsedData = JSON.parse(jsonData)
      
      if (!Array.isArray(parsedData)) {
        setError('JSON data must be an array of objects')
        setLoading(false)
        return
      }

      const response = await fetch('/api/import-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonData: parsedData,
          dataType: dataType
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        setJsonData('') // Clear the textarea on success
      } else {
        setError(data.error || 'Import failed')
        setResult(data)
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your JSON syntax.')
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    if (dataType && sampleFormats[dataType as keyof typeof sampleFormats]) {
      setJsonData(sampleFormats[dataType as keyof typeof sampleFormats])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Import JSON Data</h1>
          <p className="text-gray-600">Import your existing pharmacy data from JSON files</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Import Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-6 h-6" />
                JSON Data Import
              </CardTitle>
              <CardDescription>
                Paste your JSON data and select the appropriate data type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Type</label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type to import" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* JSON Data Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">JSON Data</label>
                  {dataType && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSampleData}
                    >
                      Load Sample Format
                    </Button>
                  )}
                </div>
                <Textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              {/* Import Button */}
              <Button
                onClick={importJsonData}
                disabled={loading || !jsonData.trim() || !dataType}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Database className="w-4 h-4 mr-2 animate-pulse" />
                    Importing Data...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import JSON Data
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success/Result Display */}
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <strong>{result.message}</strong>
                    {result.details && (
                      <div className="mt-2 text-sm">
                        <div>Total Records: {result.details.totalRecords}</div>
                        <div>Successful: {result.details.successCount}</div>
                        <div>Failed: {result.details.errorCount}</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions & Sample Formats */}
          <div className="space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  How to Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <h4 className="font-medium">Select Data Type</h4>
                      <p className="text-sm text-gray-600">Choose what type of data you're importing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <h4 className="font-medium">Prepare JSON</h4>
                      <p className="text-sm text-gray-600">Format your data as a JSON array of objects</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <h4 className="font-medium">Import</h4>
                      <p className="text-sm text-gray-600">Paste your JSON and click import</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Field Names */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Field Names</CardTitle>
                <CardDescription>
                  The system automatically maps various field name formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-700">Sales Data</h4>
                    <p className="text-gray-600">
                      Transaction_ID, Date, Drug_Name, Qty_Sold, Unit_Price, Total_Amount, 
                      Payment_Method, Customer_Name, Customer_Phone
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Medicines</h4>
                    <p className="text-gray-600">
                      Drug_Name, Generic_Name, Category, Unit_Price, Cost_Price, 
                      Quantity, Expiry_Date, Manufacturer, Batch_Number
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-700">Purchases</h4>
                    <p className="text-gray-600">
                      Drug_Name, Quantity, Unit_Cost, Selling_Price, Supplier, 
                      Expiry_Date, Batch_Number
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700">Suppliers</h4>
                    <p className="text-gray-600">
                      Supplier_Name, Contact_Person, Email, Phone, Address, 
                      City, State, Postal_Code
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Ensure your JSON is valid (use a JSON validator if needed)</li>
                  <li>• Data must be an array of objects, not a single object</li>
                  <li>• Field names are case-insensitive and flexible</li>
                  <li>• Missing fields will use default values</li>
                  <li>• Large files may take a few minutes to import</li>
                  <li>• Check the results for any failed imports</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        {result && result.success && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Import Successful! 🎉</CardTitle>
              <CardDescription className="text-green-700">
                Your data has been imported. Here's what you can do next:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="border-green-300 text-green-700">
                  <a href="/admin/dashboard">View Dashboard</a>
                </Button>
                <Button asChild variant="outline" className="border-green-300 text-green-700">
                  <a href="/test-supabase-sales">Test Sales Data</a>
                </Button>
                <Button asChild variant="outline" className="border-green-300 text-green-700">
                  <a href="/api/test-connection" target="_blank">Verify Database</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}