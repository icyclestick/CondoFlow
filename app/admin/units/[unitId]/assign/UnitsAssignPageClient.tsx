"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getResidentsForAssignment, addUnitResidency } from "@/lib/actions";
import { Combobox } from "@/components/ui/combobox";

export default function AssignUnitPage({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const router = useRouter();
  const { unitId } = useParams();
  const { toast } = useToast();
  const [residents, setResidents] = useState<any[]>([]);
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResidents, setTotalResidents] = useState(0);

  useEffect(() => {
    async function fetchResidents() {
      setLoadingResidents(true);
      setError(null);
      try {
        const data = await getResidentsForAssignment(currentPage, 50, search);
        setResidents(data.residents);
        setTotalPages(data.totalPages);
        setTotalResidents(data.total);
        if (data.residents.length > 0 && !selectedResident) {
          setSelectedResident(data.residents[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch residents");
      } finally {
        setLoadingResidents(false);
      }
    }
    fetchResidents();
  }, [currentPage, search]);

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
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
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
                  <Label htmlFor="search">Search Residents</Label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border rounded px-2 py-1 mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="resident">Select Resident</Label>
                  <Combobox
                    value={selectedResident}
                    onValueChange={setSelectedResident}
                    inputValue={search}
                    onInputValueChange={(val) => {
                      setSearch(val);
                      setCurrentPage(1);
                    }}
                    options={residents.map((r) => ({
                      value: r.id,
                      label: `${r.full_name} (${r.email})`,
                    }))}
                    placeholder="Search residents..."
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {residents.length} of {totalResidents} residents
                  {totalPages > 1 && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
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
