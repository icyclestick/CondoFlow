"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Wrench, Clock, User, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedUrgency, setSelectedUrgency] = useState("")
  const { toast } = useToast()

  const handleAssign = async (requestId: string, technician: string) => {
    try {
      toast({
        title: "Technician Assigned",
        description: `Service request has been assigned to ${technician}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign technician.",
        variant: "destructive",
      })
    }
  }

  const handleMarkResolved = async (requestId: string) => {
    try {
      toast({
        title: "Request Resolved",
        description: "The service request has been marked as resolved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark request as resolved.",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
            <p className="text-muted-foreground">Manage maintenance and service requests</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Urgent attention needed</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search service requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Urgency</option>
            <option value="emergency">Emergency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>All maintenance and service requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Request ID</th>
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Service Type</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Urgency</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Assigned To</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "SR-2025-001",
                          resident: "John Doe",
                          serviceType: "Plumbing",
                          date: "May 8, 2025",
                          urgency: "High",
                          status: "In Progress",
                          assignedTo: "Mike Johnson",
                        },
                        {
                          id: "SR-2025-002",
                          resident: "Jane Smith",
                          serviceType: "HVAC",
                          date: "May 5, 2025",
                          urgency: "Medium",
                          status: "Completed",
                          assignedTo: "Sarah Wilson",
                        },
                        {
                          id: "SR-2025-003",
                          resident: "Robert Johnson",
                          serviceType: "Electrical",
                          date: "May 1, 2025",
                          urgency: "Low",
                          status: "Pending",
                          assignedTo: "-",
                        },
                        {
                          id: "SR-2025-004",
                          resident: "Emily Davis",
                          serviceType: "Plumbing",
                          date: "May 10, 2025",
                          urgency: "Emergency",
                          status: "Assigned",
                          assignedTo: "Mike Johnson",
                        },
                        {
                          id: "SR-2025-005",
                          resident: "Michael Brown",
                          serviceType: "Appliance Repair",
                          date: "May 7, 2025",
                          urgency: "Medium",
                          status: "In Progress",
                          assignedTo: "David Lee",
                        },
                      ].map((request, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3 font-medium">{request.id}</td>
                          <td className="py-3">{request.resident}</td>
                          <td className="py-3">{request.serviceType}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.urgency === "Emergency"
                                  ? "destructive"
                                  : request.urgency === "High"
                                    ? "destructive"
                                    : request.urgency === "Medium"
                                      ? "default"
                                      : "secondary"
                              }
                            >
                              {request.urgency}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.status === "Completed"
                                  ? "default"
                                  : request.status === "In Progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">{request.assignedTo}</td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {request.status === "Pending" && (
                                <Button size="sm" onClick={() => handleAssign(request.id, "Available Technician")}>
                                  Assign
                                </Button>
                              )}
                              {request.status === "In Progress" && (
                                <Button size="sm" onClick={() => handleMarkResolved(request.id)}>
                                  Mark Resolved
                                </Button>
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
                <CardDescription>Service requests awaiting assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only pending requests...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Requests</CardTitle>
                <CardDescription>Urgent service requests requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only emergency requests...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
