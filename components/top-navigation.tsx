"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  User,
  LogOut,
  Building,
  Calendar,
  DollarSign,
  Target,
  FileCheck,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface TopNavigationProps {
  role: "admin" | "manager"
  notifications?: number
}

export default function TopNavigation({ role, notifications = 3 }: TopNavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Building, label: "Suppliers", href: "/admin/suppliers" },
    { icon: Calendar, label: "Expiry Management", href: "/admin/expiry-management" },
    { icon: DollarSign, label: "Price Forecasting", href: "/admin/price-forecasting" },
    { icon: Target, label: "Demand Analysis", href: "/admin/demand-analysis" },
    { icon: Package, label: "Inventory", href: "/admin/inventory" },
    { icon: ShoppingCart, label: "Review Requests", href: "/admin/review-requests" },
    { icon: AlertTriangle, label: "Alerts", href: "/admin/alerts", badge: notifications },
    { icon: BarChart3, label: "Reports", href: "/admin/reports" },
    { icon: FileCheck, label: "Prescription", href: "/admin/prescription" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  const managerNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/manager/dashboard" },
    { icon: ShoppingCart, label: "Stock Requests", href: "/manager/low-stock-requests" },
    { icon: TrendingUp, label: "Forecasting", href: "/manager/forecasting" },
    { icon: Package, label: "Inventory", href: "/manager/inventory" },
    { icon: AlertTriangle, label: "Alerts", href: "/manager/alerts", badge: notifications },
    { icon: FileCheck, label: "Prescription", href: "/manager/prescription" },
    { icon: Settings, label: "Settings", href: "/manager/settings" },
  ]

  const navItems = role === "admin" ? adminNavItems : managerNavItems

  return (
    <TooltipProvider>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-lg border-b border-border"
      >
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Pharm</span>
          </Link>

          {/* Desktop Navigation Icons */}
          <div className="hidden lg:flex items-center justify-center gap-1 flex-1 max-w-2xl mx-8">
            {navItems.map((item) => (
              <Tooltip key={item.href} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      size="icon"
                      className="relative h-10 w-10 hover:bg-secondary/80 transition-all duration-200"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-medium">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Right Side - Search and User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search - Hidden on mobile */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search medicines..." 
                className="pl-10 w-48 lg:w-64 h-9" 
              />
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
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

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 pb-6 border-b">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-xl">Pharm</span>
                  </div>
                  
                  <nav className="flex-1 py-6">
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <Link 
                          key={item.href} 
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 h-12 text-base"
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <Badge className="ml-auto">{item.badge}</Badge>
                            )}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </TooltipProvider>
  )
}