"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Activity,
  LayoutDashboard,
  TrendingUp,
  Package,
  AlertTriangle,
  Bell,
  BarChart3,
  Settings,
  Search,
  Menu,
  X,
  FileCheck,
  User,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ChatBot from "@/components/chatbot"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode
  role: "admin" | "manager"
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: TrendingUp, label: "Demand Forecasting", href: "/admin/forecasting" },
    { icon: Package, label: "Inventory", href: "/admin/inventory" },
    { icon: AlertTriangle, label: "Expiry Management", href: "/admin/expiry" },
    { icon: Bell, label: "Alerts", href: "/admin/alerts", badge: notifications },
    { icon: BarChart3, label: "Reports & Analytics", href: "/admin/reports" },
    { icon: FileCheck, label: "Prescription Check", href: "/admin/prescription" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  const managerNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/manager/dashboard" },
    { icon: TrendingUp, label: "View Forecasting", href: "/manager/forecasting" },
    { icon: Package, label: "Inventory", href: "/manager/inventory" },
    { icon: Bell, label: "Alerts", href: "/manager/alerts", badge: notifications },
    { icon: FileCheck, label: "Prescription Check", href: "/manager/prescription" },
    { icon: Settings, label: "Settings", href: "/manager/settings" },
  ]

  const navItems = role === "admin" ? adminNavItems : managerNavItems

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border backdrop-blur-lg bg-card/95"
      >
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold hidden sm:block">Smart Pharmacy</span>
            </Link>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search medicines, batches..." className="pl-10" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  <Link href="/login">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.nav>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 1024) ? 0 : -280 }}
        className="fixed left-0 top-16 bottom-0 w-70 bg-card border-r border-border z-40 overflow-y-auto"
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 relative"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && <Badge className="ml-auto">{item.badge}</Badge>}
              </Button>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="lg:pl-70 pt-16">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Chatbot */}
      <ChatBot />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
