"use client"

import { motion } from "framer-motion"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background noise-bg">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Pharm</span>
            </div>
            {/* Left nav links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm hover:text-primary transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          {/* Right nav links */}
          <div className="flex items-center gap-4">
            <Link href="#about" className="hidden md:block text-sm hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#contact" className="hidden md:block text-sm hover:text-primary transition-colors">
              Contact
            </Link>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Minimalist with animated SVG */}
      <section className="pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            {/* Animated SVG Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="relative w-48 h-48"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl" />
                <Image
                  src="/images/medical-cross.svg"
                  alt="Pharma"
                  width={192}
                  height={192}
                  className="relative z-10 drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            {/* Pharm Logo Text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
            >
              Pharm
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-muted-foreground max-w-2xl"
            >
              Next-generation pharmacy inventory management
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage pharmacy inventory with precision and intelligence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-gradient-to-br from-card/50 to-background noise-bg">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Pharm</span>
              </div>
            <p className="text-sm text-muted-foreground">Pharmacy inventory management powered by AI</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Pharm. All rights reserved.</p>
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
  delay = 0,
}: {
  icon: any
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="p-6 h-full glass hover:shadow-xl transition-all duration-300 group border-border/50">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  )
}
