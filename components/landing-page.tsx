"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Activity, TrendingUp, AlertTriangle, Bot, FileCheck, Package, DollarSign, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function LandingPage() {
  const [stats, setStats] = useState({
    medicinesTracked: 0,
    wastageReduced: 0,
    alertsSent: 0,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        medicinesTracked: 50000,
        wastageReduced: 85,
        alertsSent: 10000,
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: Activity,
      title: "Real-time Inventory Tracking",
      description: "Monitor medicine stock levels with live updates and automatic sync across all systems",
    },
    {
      icon: TrendingUp,
      title: "Demand Forecast",
      description:
        "Predict demand based on seasonal changes, historical sales, and usage trends for optimal stock management",
    },
    {
      icon: AlertTriangle,
      title: "Smart Expiry Management",
      description: "FEFO logic with color-coded alerts and real-time countdown to prevent medicine wastage",
    },
    {
      icon: DollarSign,
      title: "Price Comparison",
      description: "Compare prices from Amazon Pharma, Apollo, Mankind, Cipla, and Sun Pharma in real-time",
    },
    {
      icon: FileCheck,
      title: "Prescription Verification",
      description: "Upload customer prescriptions and instantly check drug availability and quantities",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive reports with inventory health, profit margins, and stock turnover analysis",
    },
    {
      icon: Bot,
      title: "AI Chatbot",
      description: "Powered by n8n workflow for instant answers to inventory queries and intelligent insights",
    },
    {
      icon: Package,
      title: "Automated Reordering",
      description: "Smart threshold alerts trigger automatic reorder workflows to maintain optimal stock",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartPharm
              </span>
            </div>
            {/* Left nav links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          {/* Right nav links */}
          <div className="flex items-center gap-4">
            <Link href="#about" className="hidden md:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="#contact" className="hidden md:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean with Pill Image */}
      <section className="pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Smart
                  </span>
                  <br />
                  <span className="text-slate-900">Pharmacy</span>
                  <br />
                  <span className="text-slate-600 text-4xl lg:text-5xl">Management</span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  Revolutionary inventory management system powered by AI. Track 10,000+ medicines, 
                  reduce wastage by 85%, and automate your entire pharmacy workflow.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/admin/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl text-lg px-8 py-6 font-semibold">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/import-json-data">
                  <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-blue-600 hover:text-blue-600 text-lg px-8 py-6 font-semibold">
                    Import Data
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-slate-600 font-medium">Medicines Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-slate-600 font-medium">Wastage Reduced</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-slate-600 font-medium">AI Monitoring</div>
                </div>
              </div>
            </div>

            {/* Right Content - Pill Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-full blur-3xl scale-110" />
                
                {/* Pill Image */}
                <div className="relative w-96 h-96 flex items-center justify-center">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full drop-shadow-2xl"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Pill Shape */}
                    <defs>
                      <linearGradient id="pillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <linearGradient id="pillGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F8FAFC" />
                        <stop offset="100%" stopColor="#E2E8F0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Pill Body */}
                    <rect
                      x="100"
                      y="150"
                      width="200"
                      height="100"
                      rx="50"
                      ry="50"
                      fill="url(#pillGradient)"
                      className="drop-shadow-lg"
                    />
                    
                    {/* Pill Cap */}
                    <rect
                      x="100"
                      y="150"
                      width="100"
                      height="100"
                      rx="50"
                      ry="50"
                      fill="url(#pillGradient2)"
                      className="drop-shadow-lg"
                    />
                    
                    {/* Highlight */}
                    <ellipse
                      cx="140"
                      cy="180"
                      rx="15"
                      ry="8"
                      fill="rgba(255,255,255,0.4)"
                    />
                  </svg>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-slate-900">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage pharmacy inventory with precision, intelligence, and complete automation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-slate-900 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">SmartPharm</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Next-generation pharmacy inventory management powered by artificial intelligence
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400">© 2025 SmartPharm. All rights reserved. Built with ❤️ for pharmacies worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group hover:-translate-y-2">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mb-6 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300">
        <Icon className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </Card>
  )
}
