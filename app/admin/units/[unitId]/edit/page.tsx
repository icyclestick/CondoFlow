"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getUnitWithDetails, updateUnit } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export default function EditUnitPage() {
  const router = useRouter();
  const { unitId } = useParams();

  const [block, setBlock] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [status, setStatus] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUnit() {
      setLoading(true);
      setError(null);
      try {
        const data = await getUnitWithDetails(unitId as string);
        setBlock(data.block || "");
        setUnitNumber(data.unit_number || "");
        setStatus(data.status || "");
        setMonthlyFee(data.monthly_fee ? String(data.monthly_fee) : "");
      } catch (err: any) {
        setError(err.message || "Failed to fetch unit");
      } finally {
        setLoading(false);
      }
    }
    if (unitId) fetchUnit();
  }, [unitId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("block", block);
      formData.set("unit_number", unitNumber);
      formData.set("status", status);
      formData.set("monthly_fee", monthlyFee);
      await updateUnit(unitId as string, formData);
      toast({ title: "Success", description: "Unit updated." });
      router.push("/admin/units");
    } catch (err: any) {
      setError(err.message || "Failed to update unit");
      toast({
        title: "Error",
        description: err.message || "Failed to update unit.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout userRole="admin">
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Unit</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="block">Block</Label>
                  <Input
                    id="block"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyFee">Monthly Fee</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
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
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
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
