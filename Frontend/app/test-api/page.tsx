"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testRegistration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const testData = {
        name: "Test User",
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: "password123"
      }

      console.log("Testing registration with:", testData)
      const response = await apiClient.register(testData)
      setResult(response)
      console.log("Registration successful:", response)
    } catch (err: any) {
      console.error("Registration failed:", err)
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiClient.login("test@example.com", "password123")
      setResult(response)
      console.log("Login successful:", response)
    } catch (err: any) {
      console.error("Login failed:", err)
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testRegistration} disabled={loading}>
              {loading ? "Testing..." : "Test Registration"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testLogin} disabled={loading}>
              {loading ? "Testing..." : "Test Login"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
