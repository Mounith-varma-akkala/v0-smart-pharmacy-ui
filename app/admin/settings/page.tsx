"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Save, Shield } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    role: "admin",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            email: profileData.email || user.email || "",
            role: profileData.role || "admin",
          })
        }
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from("profiles").update({ full_name: profile.full_name }).eq("id", user.id)

      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profile updated successfully",
        })
      }
    }
    setIsLoading(false)
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-normal mb-2">Settings</h1>
          <p className="text-muted-foreground font-light">Manage your account settings and system preferences</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-normal">Administrator Profile</h3>
                <p className="text-sm text-muted-foreground font-light">Update your admin account details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-normal">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Admin Name"
                  className="font-light"
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-normal">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" value={profile.email} disabled className="pl-10 font-light" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-light">Email cannot be changed</p>
              </div>

              <div>
                <Label className="font-normal">Role</Label>
                <Input value={profile.role} disabled className="font-light capitalize" />
              </div>
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="font-normal">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
