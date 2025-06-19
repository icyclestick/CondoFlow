"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUnitWithDetails } from "@/lib/actions";

export default function UnitDetailsPage() {
  const router = useRouter();
  const { unitId } = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUnit() {
      setLoading(true);
      setError(null);
      try {
        const data = await getUnitWithDetails(unitId as string);
        setUnit(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch unit");
      } finally {
        setLoading(false);
      }
    }
    if (unitId) fetchUnit();
  }, [unitId]);

  return (
    <MainLayout userRole="admin">
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Unit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : unit ? (
              <>
                <div>
                  <strong>Block:</strong> {unit.block}
                </div>
                <div>
                  <strong>Unit Number:</strong> {unit.unit_number}
                </div>
                <div>
                  <strong>Status:</strong> {unit.status}
                </div>
                <div>
                  <strong>Monthly Fee:</strong> ${unit.monthly_fee}
                </div>
                <div>
                  <strong>Owners:</strong>
                  {unit.owners && unit.owners.length > 0 ? (
                    <ul className="list-disc ml-6">
                      {unit.owners.map((o: any) => (
                        <li key={o.id}>{o.profiles?.full_name || "-"}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground ml-2">
                      No owners
                    </span>
                  )}
                </div>
                <div>
                  <strong>Residents:</strong>
                  {unit.residents && unit.residents.length > 0 ? (
                    <ul className="list-disc ml-6">
                      {unit.residents.map((r: any) => (
                        <li key={r.id}>{r.profiles?.full_name || "-"}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground ml-2">
                      No residents
                    </span>
                  )}
                </div>
              </>
            ) : null}
            <Button
              variant="outline"
              onClick={() => router.push("/admin/units")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
