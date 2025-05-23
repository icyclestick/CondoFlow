"use client"

import { useState } from "react"
import Link from "next/link"
import { Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [role, setRole] = useState<"admin" | "resident">("resident")

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <Building className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">CondoHub</CardTitle>
          <CardDescription>Sign in to access your condo management portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resident" onValueChange={(value) => setRole(value as "admin" | "resident")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resident">Resident</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={role === "admin" ? "/admin" : "/resident"}>Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
