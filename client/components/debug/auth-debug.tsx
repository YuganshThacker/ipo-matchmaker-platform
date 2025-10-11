"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const { user } = useAuth()

  const checkLocalStorage = () => {
    const token = localStorage.getItem("auth-token")
    console.log("Current user:", user)
    console.log("Token in localStorage:", token)
    
    if (token) {
      console.log("Token format valid:", token.startsWith("temp_token_"))
    }
  }

  const manualLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: "demo@ipoplatform.com", 
          password: "demo123" 
        }),
      })

      if (response.ok) {
        const { user, token } = await response.json()
        localStorage.setItem("auth-token", token)
        console.log("Manual login successful:", { user, token })
        window.location.reload()
      } else {
        console.error("Login failed:", response.statusText)
      }
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-sm text-orange-800">Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>User: {user ? user.name : "Not logged in"}</div>
          <div>User ID: {user?.id || "N/A"}</div>
          <div className="flex gap-2">
            <Button onClick={checkLocalStorage} size="sm" variant="outline">
              Check Auth
            </Button>
            <Button onClick={manualLogin} size="sm">
              Manual Login
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
