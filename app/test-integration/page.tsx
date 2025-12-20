'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestIntegrationPage() {
  const [mysqlStatus, setMysqlStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [mysqlError, setMysqlError] = useState<string>('')
  const [salesData, setSalesData] = useState<any>(null)
  const [salesError, setSalesError] = useState<string>('')
  const [dbInspection, setDbInspection] = useState<any>(null)

  const testMysqlConnection = async () => {
    setMysqlStatus('loading')
    try {
      const response = await fetch('/api/test-mysql')
      const result = await response.json()
      
      if (result.success) {
        setMysqlStatus('success')
        setMysqlError('')
      } else {
        setMysqlStatus('error')
        setMysqlError(result.error || 'Unknown error')
      }
    } catch (error) {
      setMysqlStatus('error')
      setMysqlError(error instanceof Error ? error.message : 'Network error')
    }
  }

  const inspectDatabase = async () => {
    try {
      const response = await fetch('/api/inspect-db')
      const result = await response.json()
      setDbInspection(result)
    } catch (error) {
      console.error('Database inspection failed:', error)
    }
  }

  const testSalesAPI = async () => {
    try {
      const response = await fetch('/api/sales/stats?period=today')
      const result = await response.json()
      
      if (result.success) {
        setSalesData(result.data)
        setSalesError('')
      } else {
        setSalesError(result.error || 'Failed to fetch sales data')
        setSalesData(null)
      }
    } catch (error) {
      setSalesError(error instanceof Error ? error.message : 'Network error')
      setSalesData(null)
    }
  }

  useEffect(() => {
    testMysqlConnection()
    inspectDatabase()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">MySQL Integration Test & Database Inspector</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* MySQL Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>MySQL Connection</CardTitle>
            <CardDescription>Test basic MySQL database connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                mysqlStatus === 'loading' ? 'bg-yellow-500' :
                mysqlStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="font-medium">
                {mysqlStatus === 'loading' ? 'Testing...' :
                 mysqlStatus === 'success' ? 'Connected' : 'Failed'}
              </span>
            </div>
            
            {mysqlError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{mysqlError}</p>
              </div>
            )}
            
            <Button onClick={testMysqlConnection} disabled={mysqlStatus === 'loading'}>
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* Sales API Test */}
        <Card>
          <CardHeader>
            <CardTitle>Sales API</CardTitle>
            <CardDescription>Test sales data retrieval from MySQL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSalesAPI}>
              Test Sales API
            </Button>
            
            {salesError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{salesError}</p>
              </div>
            )}
            
            {salesData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800">Sales Data Retrieved:</h4>
                <pre className="text-xs text-green-700 mt-2 overflow-auto max-h-40">
                  {JSON.stringify(salesData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Inspection */}
      {dbInspection && (
        <Card>
          <CardHeader>
            <CardTitle>Database Inspection</CardTitle>
            <CardDescription>Your current database structure and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Connection Status:</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${dbInspection.connection ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{dbInspection.connection ? 'Connected' : 'Failed'}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Database: {dbInspection.database}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tables Found:</h4>
                <div className="text-sm space-y-1">
                  {dbInspection.tables?.length > 0 ? (
                    dbInspection.tables.map((table: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{table.TABLE_NAME}</span>
                        <span className="text-gray-500">({table.TABLE_ROWS} rows)</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No tables found</p>
                  )}
                </div>
              </div>
            </div>

            {dbInspection.salesTableStructure && (
              <div>
                <h4 className="font-medium mb-2">Sales Table Structure ({dbInspection.salesTableStructure.tableName}):</h4>
                <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                  <table className="text-sm w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-1">Column</th>
                        <th className="text-left p-1">Type</th>
                        <th className="text-left p-1">Null</th>
                        <th className="text-left p-1">Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbInspection.salesTableStructure.columns.map((col: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-1 font-mono">{col.Field}</td>
                          <td className="p-1">{col.Type}</td>
                          <td className="p-1">{col.Null}</td>
                          <td className="p-1">{col.Key}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dbInspection.sampleData && dbInspection.sampleData.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sample Data (First 5 rows):</h4>
                <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                  <pre className="text-xs">
                    {JSON.stringify(dbInspection.sampleData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {dbInspection.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{dbInspection.error}</p>
              </div>
            )}

            <Button onClick={inspectDatabase}>
              Refresh Database Inspection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>Check if required environment variables are set</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Check your .env.local file has MySQL credentials</span>
            </div>
            <div className="text-sm text-gray-600">
              Required variables: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Configure Environment Variables</h4>
            <p className="text-sm text-gray-600">
              Update .env.local with your actual MySQL credentials
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Check Database Connection</h4>
            <p className="text-sm text-gray-600">
              Use the database inspection above to see your current tables and structure
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Test Sales Data</h4>
            <p className="text-sm text-gray-600">
              Once connected, test the sales API to see if data is being retrieved
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}