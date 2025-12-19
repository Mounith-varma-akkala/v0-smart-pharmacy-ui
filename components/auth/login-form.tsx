"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Activity, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("No user data returned")
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      if (profileError) {
        console.error("[v0] Profile fetch error:", profileError)
        router.push("/manager/dashboard")
        toast({
          title: "Login successful",
          description: "Welcome! Please complete your profile setup.",
        })
        return
      }

      if (profile?.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/manager/dashboard")
      }

      toast({
        title: "Login successful",
        description: `Welcome back, ${profile?.role || "user"}!`,
      })
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>

        <div className="max-w-md relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Activity className="w-8 h-8" />
            </div>
            <span className="text-2xl font-normal">Smart Pharma</span>
          </div>
          <h1 className="text-4xl font-normal mb-4 text-balance leading-tight">
            Welcome Back to Smart Pharmacy Management
          </h1>
          <p className="text-base text-primary-foreground/80 leading-relaxed font-light">
            Real-time inventory tracking, AI-powered forecasting, and intelligent alerts to help you manage your
            pharmacy efficiently.
          </p>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-normal mb-2">Sign In</h2>
            <p className="text-muted-foreground font-light">Enter your credentials to access your dashboard</p>
          </div>

          <Card className="p-8 border-border/50 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-normal">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@pharmacy.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-11 font-light"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-normal">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 h-11 font-light"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-normal" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground font-light pt-2">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-normal">
                  Sign up
                </Link>
              </p>
            </form>
          </Card>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground text-center font-light">
              Demo: admin@pharmacy.com / Create an account to get started
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
