"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Truck, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminMoveRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const { toast } = useToast()

  const handleApprove = async (requestId: string) => {
    try {
      toast({
        title: "Request Approved",
        description: "The move request has been approved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      toast({
        title: "Request Rejected",
        description: "The move request has been rejected.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Move Requests</h1>
            <p className="text-muted-foreground">Manage resident move-in and move-out requests</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Move-ins</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Move-outs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
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
            <option value="move-in">Move-in</option>
            <option value="move-out">Move-out</option>
          </select>
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
                <CardTitle>Move Requests</CardTitle>
                <CardDescription>All move-in and move-out requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Unit</th>
                        <th className="pb-2">Move Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "1",
                          resident: "Michael Brown",
                          type: "Move-in",
                          unit: "Block A, #203",
                          moveDate: "May 25, 2025",
                          time: "Morning",
                          status: "Pending",
                        },
                        {
                          id: "2",
                          resident: "Sarah Wilson",
                          type: "Move-out",
                          unit: "Block B, #512",
                          moveDate: "May 30, 2025",
                          time: "Afternoon",
                          status: "Approved",
                        },
                        {
                          id: "3",
                          resident: "David Lee",
                          type: "Move-in",
                          unit: "Block C, #108",
                          moveDate: "June 2, 2025",
                          time: "Morning",
                          status: "Pending",
                        },
                        {
                          id: "4",
                          resident: "Lisa Chen",
                          type: "Move-out",
                          unit: "Block A, #102",
                          moveDate: "June 5, 2025",
                          time: "Afternoon",
                          status: "Pending",
                        },
                        {
                          id: "5",
                          resident: "James Wilson",
                          type: "Move-in",
                          unit: "Block D, #401",
                          moveDate: "May 20, 2025",
                          time: "Morning",
                          status: "Completed",
                        },
                      ].map((request, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{request.resident}</td>
                          <td className="py-3">
                            <Badge variant={request.type === "Move-in" ? "default" : "secondary"}>{request.type}</Badge>
                          </td>
                          <td className="py-3">{request.unit}</td>
                          <td className="py-3">{request.moveDate}</td>
                          <td className="py-3">{request.time}</td>
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
                                View
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
                <CardDescription>Requests awaiting your approval</CardDescription>
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
                <CardDescription>Requests that have been approved</CardDescription>
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
