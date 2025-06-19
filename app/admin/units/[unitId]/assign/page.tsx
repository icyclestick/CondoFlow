"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAllResidentsWithUnits, addUnitResidency } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";

export default function AssignUnitPage() {
  const router = useRouter();
  const { unitId } = useParams();
  const { toast } = useToast();
  const [residents, setResidents] = useState<any[]>([]);
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredResidents, setFilteredResidents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchResidents() {
      setLoadingResidents(true);
      setError(null);
      try {
        const data = await getAllResidentsWithUnits();
        setResidents(data);
        setFilteredResidents(data);
        if (data.length > 0) setSelectedResident(data[0].id);
      } catch (err: any) {
        setError(err.message || "Failed to fetch residents");
      } finally {
        setLoadingResidents(false);
      }
    }
    fetchResidents();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredResidents(residents);
    } else {
      setFilteredResidents(
        residents.filter((r) =>
          r.full_name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, residents]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("unitId", unitId as string);
      formData.set("residentId", selectedResident);
      formData.set("residencyType", "tenant");
      formData.set("startDate", new Date().toISOString());
      formData.set("isPrimaryResident", "true");
      await addUnitResidency(formData);
      toast({ title: "Success", description: "Resident assigned to unit." });
      router.push("/admin/units");
    } catch (err: any) {
      setError(err.message || "Failed to assign resident");
      toast({
        title: "Error",
        description: err.message || "Failed to assign resident.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout userRole="admin">
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Assign Resident/Owner</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingResidents ? (
              <div>Loading residents...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="resident">Select Resident</Label>
                  <Combobox
                    value={selectedResident}
                    onValueChange={setSelectedResident}
                    inputValue={search}
                    onInputValueChange={setSearch}
                    options={filteredResidents.map((r) => ({
                      value: r.id,
                      label: r.full_name,
                    }))}
                    placeholder="Search residents..."
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/units")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
