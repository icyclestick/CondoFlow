"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBlock, setSelectedBlock] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  const fetchUnits = async () => {
    try {
      setIsLoading(true)
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Units Management</h1>
            <p className="text-muted-foreground">Manage condo units and their occupancy</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">200</div>
              <p className="text-xs text-muted-foreground">Across 4 blocks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">178</div>
              <p className="text-xs text-muted-foreground">89% occupancy rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22</div>
              <p className="text-xs text-muted-foreground">Available for rent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$62,300</div>
              <p className="text-xs text-muted-foreground">From occupied units</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search units..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Blocks</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
            <option value="D">Block D</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Units</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="vacant">Vacant</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-4">Unit</th>
                        <th className="p-4">Block</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Resident</th>
                        <th className="p-4">Monthly Fee</th>
                        <th className="p-4">Move-in Date</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          unit: "#101",
                          block: "A",
                          status: "Occupied",
                          resident: "John Doe",
                          monthlyFee: "$350",
                          moveInDate: "June 15, 2024",
                        },
                        {
                          unit: "#102",
                          block: "A",
                          status: "Vacant",
                          resident: "-",
                          monthlyFee: "$350",
                          moveInDate: "-",
                        },
                        {
                          unit: "#103",
                          block: "A",
                          status: "Occupied",
                          resident: "Jane Smith",
                          monthlyFee: "$350",
                          moveInDate: "January 10, 2025",
                        },
                        {
                          unit: "#201",
                          block: "A",
                          status: "Occupied",
                          resident: "Robert Johnson",
                          monthlyFee: "$375",
                          moveInDate: "March 5, 2023",
                        },
                        {
                          unit: "#202",
                          block: "A",
                          status: "Vacant",
                          resident: "-",
                          monthlyFee: "$375",
                          moveInDate: "-",
                        },
                        {
                          unit: "#203",
                          block: "A",
                          status: "Occupied",
                          resident: "Emily Davis",
                          monthlyFee: "$375",
                          moveInDate: "November 20, 2024",
                        },
                        {
                          unit: "#301",
                          block: "A",
                          status: "Occupied",
                          resident: "Michael Brown",
                          monthlyFee: "$400",
                          moveInDate: "August 15, 2022",
                        },
                        {
                          unit: "#302",
                          block: "A",
                          status: "Vacant",
                          resident: "-",
                          monthlyFee: "$400",
                          moveInDate: "-",
                        },
                      ].map((unit, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4 font-medium">{unit.unit}</td>
                          <td className="p-4">{unit.block}</td>
                          <td className="p-4">
                            <Badge variant={unit.status === "Occupied" ? "default" : "secondary"}>{unit.status}</Badge>
                          </td>
                          <td className="p-4">{unit.resident}</td>
                          <td className="p-4 font-medium">{unit.monthlyFee}</td>
                          <td className="p-4">{unit.moveInDate}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              {unit.status === "Vacant" && <Button size="sm">Assign</Button>}
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
          <TabsContent value="occupied" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupied Units</CardTitle>
                <CardDescription>Units currently occupied by residents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only occupied units...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="vacant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vacant Units</CardTitle>
                <CardDescription>Units available for new residents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Filter will show only vacant units...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
