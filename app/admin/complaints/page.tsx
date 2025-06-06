"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const { toast } = useToast()

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    try {
      toast({
        title: "Status Updated",
        description: `Complaint status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint status.",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Complaint Management</h1>
            <p className="text-muted-foreground">Manage and respond to resident complaints</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Being addressed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search complaints..."
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
            <option value="noise">Noise Complaint</option>
            <option value="maintenance">Maintenance Issue</option>
            <option value="security">Security Concern</option>
            <option value="neighbor">Neighbor Dispute</option>
            <option value="common-area">Common Area Issue</option>
            <option value="other">Other</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Complaints</CardTitle>
                <CardDescription>Manage all resident complaints and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">ID</th>
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Urgency</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Last Update</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "C-2025-001",
                          resident: "John Doe",
                          type: "Noise Complaint",
                          date: "May 8, 2025",
                          urgency: "Medium",
                          status: "In Progress",
                          lastUpdate: "May 10, 2025",
                        },
                        {
                          id: "C-2025-002",
                          resident: "Jane Smith",
                          type: "Maintenance Issue",
                          date: "May 5, 2025",
                          urgency: "High",
                          status: "Resolved",
                          lastUpdate: "May 7, 2025",
                        },
                        {
                          id: "C-2025-003",
                          resident: "Robert Johnson",
                          type: "Common Area Issue",
                          date: "May 1, 2025",
                          urgency: "Low",
                          status: "Pending",
                          lastUpdate: "May 1, 2025",
                        },
                        {
                          id: "C-2025-004",
                          resident: "Emily Davis",
                          type: "Security Concern",
                          date: "April 28, 2025",
                          urgency: "High",
                          status: "Resolved",
                          lastUpdate: "May 2, 2025",
                        },
                        {
                          id: "C-2025-005",
                          resident: "Michael Brown",
                          type: "Neighbor Dispute",
                          date: "May 3, 2025",
                          urgency: "Medium",
                          status: "In Progress",
                          lastUpdate: "May 5, 2025",
                        },
                      ].map((complaint, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3 font-medium">{complaint.id}</td>
                          <td className="py-3">{complaint.resident}</td>
                          <td className="py-3">{complaint.type}</td>
                          <td className="py-3">{complaint.date}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                complaint.urgency === "High"
                                  ? "destructive"
                                  : complaint.urgency === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {complaint.urgency}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                complaint.status === "Resolved"
                                  ? "default"
                                  : complaint.status === "In Progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {complaint.status}
                            </Badge>
                          </td>
                          <td className="py-3">{complaint.lastUpdate}</td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                Reply
                              </Button>
                              {complaint.status !== "Resolved" && (
                                <Button size="sm" onClick={() => handleUpdateStatus(complaint.id, "Resolved")}>
                                  Resolve
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
          <TabsContent value="open" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Complaints</CardTitle>
                <CardDescription>Complaints that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only open complaints...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="urgent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Complaints</CardTitle>
                <CardDescription>High priority complaints requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only urgent complaints...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
