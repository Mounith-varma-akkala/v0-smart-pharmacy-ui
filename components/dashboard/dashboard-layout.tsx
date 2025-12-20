"use client"

import type React from "react"
import TopNavigation from "@/components/top-navigation"
import PharmacyChatbot from "@/components/pharmacy-chatbot"

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode
  role: "admin" | "manager"
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation role={role} />

      {/* Main Content */}
      <main className="pt-16">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Pharmacy Chatbot */}
      <PharmacyChatbot />
    </div>
  )
}
