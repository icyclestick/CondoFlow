"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminGatepassPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const { toast } = useToast()

  const handleApprove = async (requestId: string) => {
    try {
      toast({
        title: "Gatepass Approved",
        description: "The gatepass request has been approved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve gatepass.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      toast({
        title: "Gatepass Rejected",
        description: "The gatepass request has been rejected.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject gatepass.",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gatepass Management</h1>
            <p className="text-muted-foreground">Manage item transport and gatepass requests</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search gatepass requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gatepass Requests</CardTitle>
                <CardDescription>All item transport and gatepass requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Request ID</th>
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Items</th>
                        <th className="pb-2">Transport Date</th>
                        <th className="pb-2">Reason</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "GP-2025-001",
                          resident: "Thomas Anderson",
                          items: "Furniture (3 items)",
                          date: "May 14, 2025",
                          reason: "Delivery of new items",
                          status: "Pending",
                        },
                        {
                          id: "GP-2025-002",
                          resident: "Lisa Chen",
                          items: "Electronics (2 items)",
                          date: "May 15, 2025",
                          reason: "Item for repair",
                          status: "Approved",
                        },
                        {
                          id: "GP-2025-003",
                          resident: "James Wilson",
                          items: "Appliances (1 item)",
                          date: "May 16, 2025",
                          reason: "Removal of items",
                          status: "Pending",
                        },
                        {
                          id: "GP-2025-004",
                          resident: "Maria Garcia",
                          items: "Furniture (5 items)",
                          date: "May 17, 2025",
                          reason: "Delivery of new items",
                          status: "Pending",
                        },
                        {
                          id: "GP-2025-005",
                          resident: "Robert Johnson",
                          items: "Electronics (3 items)",
                          date: "May 12, 2025",
                          reason: "Item for repair",
                          status: "Completed",
                        },
                      ].map((request, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3 font-medium">{request.id}</td>
                          <td className="py-3">{request.resident}</td>
                          <td className="py-3">{request.items}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">{request.reason}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.status === "Approved"
                                  ? "default"
                                  : request.status === "Completed"
                                    ? "secondary"
                                    : request.status === "Pending"
                                      ? "outline"
                                      : "destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                              {request.status === "Pending" && (
                                <>
                                  <Button size="sm" onClick={() => handleApprove(request.id)}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                                    Reject
                                  </Button>
                                </>
                              )}
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
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Gatepass requests awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only pending requests...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved Requests</CardTitle>
                <CardDescription>Gatepass requests that have been approved</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only approved requests...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
