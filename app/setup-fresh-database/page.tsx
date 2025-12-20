'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertTriangle, Database, Trash2, RefreshCw } from 'lucide-react'

export default function SetupFreshDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const setupFreshDatabase = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/reset-database', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || data.message || 'Failed to set up database')
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Fresh Database Setup</h1>
          <p className="text-gray-600">Create a new pharmacy database with sample data</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              Database Setup Wizard
            </CardTitle>
            <CardDescription>
              This will create a fresh database with all necessary tables and sample data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will clear all existing data and create fresh sample data.
                All current records will be replaced. Make sure you have a backup if needed.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What will be created:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Core Tables</h4>
                    <p className="text-sm text-gray-600">Users, Medicines, Sales, Suppliers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Sample Data</h4>
                    <p className="text-sm text-gray-600">15 medicines, 45+ sales records</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Relationships</h4>
                    <p className="text-sm text-gray-600">Foreign keys, indexes, triggers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Features</h4>
                    <p className="text-sm text-gray-600">Stock requests, substitutions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={setupFreshDatabase}
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Create Fresh Database
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <strong>{result.message}</strong>
                  </AlertDescription>
                </Alert>

                {result.details && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Setup Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {result.details.medicinesCount}
                          </div>
                          <div className="text-sm text-gray-600">Medicines Created</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {result.details.salesCount}
                          </div>
                          <div className="text-sm text-gray-600">Sales Records</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {result.details.suppliersCount}
                          </div>
                          <div className="text-sm text-gray-600">Suppliers</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result.success && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Next Steps:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Visit the <a href="/admin/dashboard" className="text-blue-600 hover:underline">Admin Dashboard</a> to see your data</li>
                      <li>Check the <a href="/test-supabase-sales" className="text-blue-600 hover:underline">Sales Test Page</a> to verify sales data</li>
                      <li>Explore the <a href="/populate-data" className="text-blue-600 hover:underline">Populate Data Page</a> to add more sample data</li>
                      <li>Start using the pharmacy management system!</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Setup Instructions</CardTitle>
            <CardDescription>
              If the automatic setup doesn't work, follow these manual steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Option 1: Using Supabase Dashboard</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-4">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy the contents of <code className="bg-gray-100 px-2 py-1 rounded">scripts/fresh-database-setup.sql</code></li>
                <li>Paste and run the SQL script</li>
                <li>Verify tables were created in the Table Editor</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Option 2: Using Supabase CLI</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div>supabase db reset</div>
                <div>supabase db push</div>
                <div>psql -h [your-host] -U postgres -d postgres -f scripts/fresh-database-setup.sql</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Option 3: Create New Supabase Project</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-4">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                <li>Create a new project</li>
                <li>Copy the project URL and anon key</li>
                <li>Update your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file</li>
                <li>Run the SQL script in the new project's SQL Editor</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}