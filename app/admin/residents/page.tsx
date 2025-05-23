import { Download, Plus, Search } from "lucide-react"

import { MainLayout } from "@/components/main-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ResidentsPage() {
  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Residents</h1>
            <p className="text-muted-foreground">Manage residents and their information</p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resident
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search residents..." className="pl-8" />
          </div>
          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="">All Blocks</option>
            <option value="a">Block A</option>
            <option value="b">Block B</option>
            <option value="c">Block C</option>
            <option value="d">Block D</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Residents</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-4">Name</th>
                        <th className="p-4">Unit</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Move-in Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "John Doe",
                          unit: "Block A, #203",
                          type: "Owner",
                          contact: "john.doe@example.com",
                          moveIn: "June 15, 2024",
                          status: "Active",
                        },
                        {
                          name: "Jane Smith",
                          unit: "Block B, #512",
                          type: "Tenant",
                          contact: "jane.smith@example.com",
                          moveIn: "January 10, 2025",
                          status: "Active",
                        },
                        {
                          name: "Robert Johnson",
                          unit: "Block C, #108",
                          type: "Owner",
                          contact: "robert.j@example.com",
                          moveIn: "March 5, 2023",
                          status: "Active",
                        },
                        {
                          name: "Emily Davis",
                          unit: "Block A, #305",
                          type: "Tenant",
                          contact: "emily.d@example.com",
                          moveIn: "November 20, 2024",
                          status: "Active",
                        },
                        {
                          name: "Michael Brown",
                          unit: "Block D, #401",
                          type: "Owner",
                          contact: "michael.b@example.com",
                          moveIn: "August 15, 2022",
                          status: "Inactive",
                        },
                        {
                          name: "Sarah Wilson",
                          unit: "Block B, #210",
                          type: "Tenant",
                          contact: "sarah.w@example.com",
                          moveIn: "February 28, 2025",
                          status: "Active",
                        },
                        {
                          name: "David Lee",
                          unit: "Block C, #307",
                          type: "Owner",
                          contact: "david.l@example.com",
                          moveIn: "July 10, 2023",
                          status: "Active",
                        },
                        {
                          name: "Lisa Chen",
                          unit: "Block A, #102",
                          type: "Tenant",
                          contact: "lisa.c@example.com",
                          moveIn: "April 5, 2024",
                          status: "Active",
                        },
                      ].map((resident, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={`/placeholder.svg?height=40&width=40&text=${resident.name.charAt(0)}`}
                                />
                                <AvatarFallback>{resident.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{resident.name}</p>
                                <p className="text-sm text-muted-foreground">{resident.contact}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{resident.unit}</td>
                          <td className="p-4">{resident.type}</td>
                          <td className="p-4">{resident.contact}</td>
                          <td className="p-4">{resident.moveIn}</td>
                          <td className="p-4">
                            <Badge variant={resident.status === "Active" ? "default" : "secondary"}>
                              {resident.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
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
          <TabsContent value="owners" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-4">Name</th>
                        <th className="p-4">Unit</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Move-in Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "John Doe",
                          unit: "Block A, #203",
                          contact: "john.doe@example.com",
                          moveIn: "June 15, 2024",
                          status: "Active",
                        },
                        {
                          name: "Robert Johnson",
                          unit: "Block C, #108",
                          contact: "robert.j@example.com",
                          moveIn: "March 5, 2023",
                          status: "Active",
                        },
                        {
                          name: "Michael Brown",
                          unit: "Block D, #401",
                          contact: "michael.b@example.com",
                          moveIn: "August 15, 2022",
                          status: "Inactive",
                        },
                        {
                          name: "David Lee",
                          unit: "Block C, #307",
                          contact: "david.l@example.com",
                          moveIn: "July 10, 2023",
                          status: "Active",
                        },
                      ].map((resident, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={`/placeholder.svg?height=40&width=40&text=${resident.name.charAt(0)}`}
                                />
                                <AvatarFallback>{resident.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{resident.name}</p>
                                <p className="text-sm text-muted-foreground">{resident.contact}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{resident.unit}</td>
                          <td className="p-4">{resident.contact}</td>
                          <td className="p-4">{resident.moveIn}</td>
                          <td className="p-4">
                            <Badge variant={resident.status === "Active" ? "default" : "secondary"}>
                              {resident.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
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
          <TabsContent value="tenants" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-4">Name</th>
                        <th className="p-4">Unit</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Move-in Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "Jane Smith",
                          unit: "Block B, #512",
                          contact: "jane.smith@example.com",
                          moveIn: "January 10, 2025",
                          status: "Active",
                        },
                        {
                          name: "Emily Davis",
                          unit: "Block A, #305",
                          contact: "emily.d@example.com",
                          moveIn: "November 20, 2024",
                          status: "Active",
                        },
                        {
                          name: "Sarah Wilson",
                          unit: "Block B, #210",
                          contact: "sarah.w@example.com",
                          moveIn: "February 28, 2025",
                          status: "Active",
                        },
                        {
                          name: "Lisa Chen",
                          unit: "Block A, #102",
                          contact: "lisa.c@example.com",
                          moveIn: "April 5, 2024",
                          status: "Active",
                        },
                      ].map((resident, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={`/placeholder.svg?height=40&width=40&text=${resident.name.charAt(0)}`}
                                />
                                <AvatarFallback>{resident.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{resident.name}</p>
                                <p className="text-sm text-muted-foreground">{resident.contact}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{resident.unit}</td>
                          <td className="p-4">{resident.contact}</td>
                          <td className="p-4">{resident.moveIn}</td>
                          <td className="p-4">
                            <Badge variant={resident.status === "Active" ? "default" : "secondary"}>
                              {resident.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
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
        </Tabs>
      </div>
    </MainLayout>
  )
}
