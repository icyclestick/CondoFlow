"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus } from "lucide-react"
import { addUnitOwnership, addUnitResidency } from "@/lib/actions/improved-residents"

interface CoOwner {
  id: string
  name: string
  email: string
  percentage: number
}

export default function CreateOwnershipPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [ownershipType, setOwnershipType] = useState<"single" | "co-owned">("single")
  const [willLiveInUnit, setWillLiveInUnit] = useState(false)
  const [coOwners, setCoOwners] = useState<CoOwner[]>([
    { id: "1", name: "", email: "", percentage: 50 },
    { id: "2", name: "", email: "", percentage: 50 },
  ])
  const router = useRouter()

  const addCoOwner = () => {
    const newId = (coOwners.length + 1).toString()
    setCoOwners([...coOwners, { id: newId, name: "", email: "", percentage: 0 }])
  }

  const removeCoOwner = (id: string) => {
    if (coOwners.length > 2) {
      setCoOwners(coOwners.filter((owner) => owner.id !== id))
    }
  }

  const updateCoOwner = (id: string, field: keyof CoOwner, value: string | number) => {
    setCoOwners(coOwners.map((owner) => (owner.id === id ? { ...owner, [field]: value } : owner)))
  }

  const totalPercentage = coOwners.reduce((sum, owner) => sum + owner.percentage, 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Create ownership records
      if (ownershipType === "single") {
        await addUnitOwnership(formData)
      } else {
        // Handle co-ownership - create multiple records
        for (const owner of coOwners) {
          if (owner.name && owner.email && owner.percentage > 0) {
            const coOwnerFormData = new FormData()
            coOwnerFormData.append("unitId", formData.get("unit") as string)
            coOwnerFormData.append("ownerId", owner.id) // This would need to be resolved to actual user ID
            coOwnerFormData.append("ownershipPercentage", owner.percentage.toString())
            coOwnerFormData.append("ownershipType", owner.id === "1" ? "primary" : "co-owner")
            coOwnerFormData.append("startDate", formData.get("ownershipStartDate") as string)

            await addUnitOwnership(coOwnerFormData)
          }
        }
      }

      // If owner will live in unit, create residency record
      if (willLiveInUnit) {
        const residencyFormData = new FormData()
        residencyFormData.append("unitId", formData.get("unit") as string)
        residencyFormData.append("residentId", formData.get("ownerId") as string)
        residencyFormData.append("residencyType", "owner-occupied")
        residencyFormData.append(
          "startDate",
          (formData.get("moveInDate") as string) || (formData.get("ownershipStartDate") as string),
        )
        residencyFormData.append("isPrimaryResident", "true")

        await addUnitResidency(residencyFormData)
      }

      router.push("/admin/ownership")
    } catch (error) {
      console.error("Error creating ownership:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Unit Ownership</h1>
          <p className="text-muted-foreground">Register new ownership for a unit</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Ownership Details</CardTitle>
              <CardDescription>Enter the ownership information for this unit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select name="unit" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a-101">Block A, Unit 101</SelectItem>
                      <SelectItem value="a-102">Block A, Unit 102</SelectItem>
                      <SelectItem value="b-201">Block B, Unit 201</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownershipStartDate">Ownership Start Date</Label>
                  <Input id="ownershipStartDate" name="ownershipStartDate" type="date" required />
                  <p className="text-xs text-muted-foreground">When the owner actually purchased/acquired this unit</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Ownership Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="single"
                      name="ownershipType"
                      value="single"
                      checked={ownershipType === "single"}
                      onChange={(e) => setOwnershipType(e.target.value as "single" | "co-owned")}
                    />
                    <Label htmlFor="single">Single Owner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="co-owned"
                      name="ownershipType"
                      value="co-owned"
                      checked={ownershipType === "co-owned"}
                      onChange={(e) => setOwnershipType(e.target.value as "single" | "co-owned")}
                    />
                    <Label htmlFor="co-owned">Co-Ownership</Label>
                  </div>
                </div>
              </div>

              {ownershipType === "single" ? (
                <div className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input id="ownerName" name="ownerName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerEmail">Owner Email</Label>
                      <Input id="ownerEmail" name="ownerEmail" type="email" required />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Co-Owners</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCoOwner}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Co-Owner
                    </Button>
                  </div>

                  {coOwners.map((owner, index) => (
                    <div key={owner.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Owner {index + 1}</h4>
                        {coOwners.length > 2 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeCoOwner(owner.id)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={owner.name}
                            onChange={(e) => updateCoOwner(owner.id, "name", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={owner.email}
                            onChange={(e) => updateCoOwner(owner.id, "email", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ownership %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={owner.percentage}
                            onChange={(e) =>
                              updateCoOwner(owner.id, "percentage", Number.parseFloat(e.target.value) || 0)
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Ownership:</span>
                    <span className={`font-bold ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}>
                      {totalPercentage}%
                    </span>
                  </div>
                  {totalPercentage !== 100 && <p className="text-sm text-red-600">Total ownership must equal 100%</p>}
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <Label>Residency Information</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="willLiveInUnit"
                    checked={willLiveInUnit}
                    onCheckedChange={(checked) => setWillLiveInUnit(checked as boolean)}
                  />
                  <Label htmlFor="willLiveInUnit">Owner will live in this unit (Owner-Occupied)</Label>
                </div>

                {willLiveInUnit && (
                  <div className="space-y-2">
                    <Label htmlFor="moveInDate">Move-in Date</Label>
                    <Input id="moveInDate" name="moveInDate" type="date" />
                    <p className="text-xs text-muted-foreground">
                      When the owner will start living in the unit (can be different from purchase date)
                    </p>
                  </div>
                )}

                {!willLiveInUnit && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Investment Property:</strong> This unit will be available for rental. You can assign
                      tenants later from the Units Management page.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || (ownershipType === "co-owned" && totalPercentage !== 100)}>
                  {isLoading ? "Creating..." : "Create Ownership"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  )
}
