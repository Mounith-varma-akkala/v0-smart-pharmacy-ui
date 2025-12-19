import { useState, useEffect } from 'react'

// Real-time polling service for MySQL sales data
// Since MySQL doesn't have built-in real-time subscriptions like Supabase,
// we'll use polling and WebSocket connections for real-time updates

class MySQLRealtimeService {
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private callbacks: Map<string, Function[]> = new Map()

  // Subscribe to sales data changes with polling
  subscribeSales(callback: Function, pollInterval: number = 30000) {
    const subscriptionId = `sales_${Date.now()}_${Math.random()}`
    
    // Add callback to the list
    if (!this.callbacks.has('sales')) {
      this.callbacks.set('sales', [])
    }
    this.callbacks.get('sales')?.push(callback)

    // Start polling if not already started
    if (!this.intervals.has('sales')) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/sales/stats?period=today')
          const result = await response.json()
          
          if (result.success) {
            // Notify all subscribers
            this.callbacks.get('sales')?.forEach(cb => cb(result.data))
          }
        } catch (error) {
          console.error('Real-time sales polling error:', error)
        }
      }, pollInterval)

      this.intervals.set('sales', interval)
    }

    return subscriptionId
  }

  // Subscribe to sales statistics changes
  subscribeSalesStats(callback: Function, period: string = 'today', pollInterval: number = 60000) {
    const subscriptionId = `sales_stats_${period}_${Date.now()}_${Math.random()}`
    const key = `sales_stats_${period}`
    
    // Add callback to the list
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, [])
    }
    this.callbacks.get(key)?.push(callback)

    // Start polling if not already started
    if (!this.intervals.has(key)) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/sales/stats?period=${period}`)
          const result = await response.json()
          
          if (result.success) {
            // Notify all subscribers
            this.callbacks.get(key)?.forEach(cb => cb(result.data))
          }
        } catch (error) {
          console.error(`Real-time sales stats polling error for ${period}:`, error)
        }
      }, pollInterval)

      this.intervals.set(key, interval)
    }

    return subscriptionId
  }

  // Unsubscribe from updates
  unsubscribe(subscriptionId: string) {
    // Find and remove the callback
    for (const [key, callbacks] of this.callbacks.entries()) {
      const index = callbacks.findIndex(cb => cb.subscriptionId === subscriptionId)
      if (index !== -1) {
        callbacks.splice(index, 1)
        
        // If no more callbacks, stop polling
        if (callbacks.length === 0) {
          const interval = this.intervals.get(key)
          if (interval) {
            clearInterval(interval)
            this.intervals.delete(key)
          }
          this.callbacks.delete(key)
        }
        break
      }
    }
  }

  // Clean up all subscriptions
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()
    this.callbacks.clear()
  }

  // Trigger manual refresh for all subscribers
  async refreshSales() {
    try {
      const response = await fetch('/api/sales/stats?period=today')
      const result = await response.json()
      
      if (result.success) {
        this.callbacks.get('sales')?.forEach(cb => cb(result.data))
      }
    } catch (error) {
      console.error('Manual sales refresh error:', error)
    }
  }
}

// Export singleton instance
export const mysqlRealtime = new MySQLRealtimeService()

// Hook for using real-time sales data
export function useRealtimeSales(pollInterval?: number) {
  const [data, setData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setIsConnected(true)
    
    const subscriptionId = mysqlRealtime.subscribeSales(
      (salesData: any) => setData(salesData),
      pollInterval
    )

    return () => {
      mysqlRealtime.unsubscribe(subscriptionId)
      setIsConnected(false)
    }
  }, [pollInterval])

  return { data, isConnected, refresh: mysqlRealtime.refreshSales }
}

// Hook for using real-time sales statistics
export function useRealtimeSalesStats(period: string = 'today', pollInterval?: number) {
  const [data, setData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setIsConnected(true)
    
    const subscriptionId = mysqlRealtime.subscribeSalesStats(
      (statsData: any) => setData(statsData),
      period,
      pollInterval
    )

    return () => {
      mysqlRealtime.unsubscribe(subscriptionId)
      setIsConnected(false)
    }
  }, [period, pollInterval])

  return { data, isConnected, refresh: () => mysqlRealtime.refreshSales() }
}