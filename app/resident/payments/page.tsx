"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, CreditCard, DollarSign } from "lucide-react"

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)

  const handlePayNow = (paymentId: string) => {
    setSelectedPayment(paymentId)
    // Here you would integrate with your payment processor
    // For now, we'll just show a success message
    setTimeout(() => {
      setSelectedPayment(null)
      // Show success toast
    }, 2000)
  }

  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">View and manage your payments and dues</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$350.00</div>
              <p className="text-xs text-muted-foreground">Due on May 30, 2025</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$350.00</div>
              <p className="text-xs text-muted-foreground">Association dues</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,750.00</div>
              <p className="text-xs text-muted-foreground">Total paid this year</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="outstanding">
          <TabsList>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>
          <TabsContent value="outstanding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <CardDescription>Payments that are due or overdue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Due Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "1",
                          type: "Association Dues",
                          amount: "$350.00",
                          dueDate: "May 30, 2025",
                          status: "Due",
                        },
                        {
                          id: "2",
                          type: "Parking Fee",
                          amount: "$50.00",
                          dueDate: "May 30, 2025",
                          status: "Due",
                        },
                      ].map((payment, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{payment.type}</td>
                          <td className="py-3 font-medium">{payment.amount}</td>
                          <td className="py-3">{payment.dueDate}</td>
                          <td className="py-3">
                            <Badge variant="outline">{payment.status}</Badge>
                          </td>
                          <td className="py-3">
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(payment.id)}
                              disabled={selectedPayment === payment.id}
                            >
                              {selectedPayment === payment.id ? "Processing..." : "Pay Now"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Your payment records and receipts</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          date: "April 30, 2025",
                          type: "Association Dues",
                          amount: "$350.00",
                          method: "Credit Card",
                          status: "Paid",
                        },
                        {
                          date: "April 30, 2025",
                          type: "Parking Fee",
                          amount: "$50.00",
                          method: "Bank Transfer",
                          status: "Paid",
                        },
                        {
                          date: "March 30, 2025",
                          type: "Association Dues",
                          amount: "$350.00",
                          method: "Credit Card",
                          status: "Paid",
                        },
                        {
                          date: "March 30, 2025",
                          type: "Parking Fee",
                          amount: "$50.00",
                          method: "Credit Card",
                          status: "Paid",
                        },
                        {
                          date: "February 28, 2025",
                          type: "Association Dues",
                          amount: "$350.00",
                          method: "Bank Transfer",
                          status: "Paid",
                        },
                      ].map((payment, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{payment.date}</td>
                          <td className="py-3">{payment.type}</td>
                          <td className="py-3 font-medium">{payment.amount}</td>
                          <td className="py-3">{payment.method}</td>
                          <td className="py-3">
                            <Badge variant="default">{payment.status}</Badge>
                          </td>
                          <td className="py-3">
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
