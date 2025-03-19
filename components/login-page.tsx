"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const { login, signup, isLoading, error, clearError } = useAuthStore()
  const [activeTab, setActiveTab] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [validationError, setValidationError] = useState("")

  // Clear validation error when switching tabs
  useEffect(() => {
    setValidationError("")
    clearError()
  }, [activeTab, clearError])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setValidationError("Please enter both username and password")
      return
    }

    setValidationError("")
    await login(username, password)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setValidationError("Please enter both username and password")
      return
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    setValidationError("")
    await signup(username, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Database size={40} className="text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Voice Database Assistant</CardTitle>
          <CardDescription className="text-gray-400">Query your database using voice, text, or SQL</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a]">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {(error || validationError) && (
              <Alert className="mt-4 bg-red-900/20 border-red-800">
                <AlertDescription>{error || validationError}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#2a2a2a] border-[#3a3a3a]"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#2a2a2a] border-[#3a3a3a]"
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#2a2a2a] border-[#3a3a3a]"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#2a2a2a] border-[#3a3a3a]"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#2a2a2a] border-[#3a3a3a]"
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-gray-400 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

