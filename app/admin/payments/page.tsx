"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign, TrendingUp, AlertCircle, Download } from "lucide-react"

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedType, setSelectedType] = useState("")

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
            <p className="text-muted-foreground">Manage resident payments and dues</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$62,300</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,750</div>
              <p className="text-xs text-muted-foreground">From 25 residents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.6%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3,200</div>
              <p className="text-xs text-muted-foreground">From 8 residents</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search payments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Types</option>
            <option value="association-dues">Association Dues</option>
            <option value="parking">Parking Fee</option>
            <option value="utilities">Utilities</option>
            <option value="amenity">Amenity Fee</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>All payment records and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Unit</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Due Date</th>
                        <th className="pb-2">Payment Date</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          resident: "John Doe",
                          unit: "A-203",
                          type: "Association Dues",
                          amount: "$350.00",
                          dueDate: "May 30, 2025",
                          paymentDate: "May 28, 2025",
                          method: "Credit Card",
                          status: "Paid",
                        },
                        {
                          resident: "Jane Smith",
                          unit: "B-512",
                          type: "Parking Fee",
                          amount: "$50.00",
                          dueDate: "May 30, 2025",
                          paymentDate: "-",
                          method: "-",
                          status: "Pending",
                        },
                        {
                          resident: "Robert Johnson",
                          unit: "C-108",
                          type: "Association Dues",
                          amount: "$350.00",
                          dueDate: "April 30, 2025",
                          paymentDate: "-",
                          method: "-",
                          status: "Overdue",
                        },
                        {
                          resident: "Emily Davis",
                          unit: "A-305",
                          type: "Utilities",
                          amount: "$125.00",
                          dueDate: "May 30, 2025",
                          paymentDate: "May 25, 2025",
                          method: "Bank Transfer",
                          status: "Paid",
                        },
                        {
                          resident: "Michael Brown",
                          unit: "D-401",
                          type: "Association Dues",
                          amount: "$350.00",
                          dueDate: "May 30, 2025",
                          paymentDate: "-",
                          method: "-",
                          status: "Pending",
                        },
                      ].map((payment, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{payment.resident}</td>
                          <td className="py-3">{payment.unit}</td>
                          <td className="py-3">{payment.type}</td>
                          <td className="py-3 font-medium">{payment.amount}</td>
                          <td className="py-3">{payment.dueDate}</td>
                          <td className="py-3">{payment.paymentDate}</td>
                          <td className="py-3">{payment.method}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                payment.status === "Paid"
                                  ? "default"
                                  : payment.status === "Overdue"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {payment.status === "Paid" && (
                                <Button size="sm" variant="outline">
                                  Receipt
                                </Button>
                              )}
                              {payment.status !== "Paid" && <Button size="sm">Mark Paid</Button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="outstanding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <CardDescription>Payments that are pending or overdue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only outstanding payments...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Payments</CardTitle>
                <CardDescription>Payments that are past their due date</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only overdue payments...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
