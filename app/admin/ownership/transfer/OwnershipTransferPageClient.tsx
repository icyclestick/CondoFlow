"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { transferUnitOwnership, getAllResidentsWithUnits } from "@/lib/actions";

export default function TransferOwnershipPage({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);

  // Form state
  const [ownershipId, setOwnershipId] = useState(
    searchParams.get("ownershipId") || ""
  );
  const [newOwnerId, setNewOwnerId] = useState("");
  const [transferPercentage, setTransferPercentage] = useState(100);
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transferReason, setTransferReason] = useState("");
  const [partialTransfer, setPartialTransfer] = useState(false);
  const [notes, setNotes] = useState("");
  const [confirmTransfer, setConfirmTransfer] = useState(false);

  useEffect(() => {
    async function fetchResidents() {
      try {
        setLoadingResidents(true);
        const data = await getAllResidentsWithUnits();
        setResidents(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch residents",
          variant: "destructive",
        });
      } finally {
        setLoadingResidents(false);
      }
    }

    fetchResidents();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!ownershipId) {
        throw new Error("Please select an ownership record to transfer");
      }

      if (!newOwnerId) {
        throw new Error("Please select a new owner");
      }

      if (!confirmTransfer) {
        throw new Error("Please confirm the transfer");
      }

      const formData = new FormData();
      formData.set("ownershipId", ownershipId);
      formData.set("newOwnerId", newOwnerId);
      formData.set("transferDate", transferDate);
      formData.set("transferReason", transferReason);
      formData.set("partialTransfer", partialTransfer.toString());
      formData.set("transferPercentage", transferPercentage.toString());

      await transferUnitOwnership(formData);

      toast({
        title: "Success",
        description: "Ownership transferred successfully",
      });
      router.push("/admin/ownership");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to transfer ownership",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/ownership">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Transfer Ownership
            </h1>
            <p className="text-muted-foreground">
              Transfer unit ownership from one owner to another
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>
                Specify the ownership transfer information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownershipId">Ownership ID</Label>
                  <Input
                    id="ownershipId"
                    value={ownershipId}
                    onChange={(e) => setOwnershipId(e.target.value)}
                    placeholder="Enter ownership ID"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The ID of the ownership record to transfer
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newOwnerId">New Owner</Label>
                  <Select
                    value={newOwnerId}
                    onValueChange={setNewOwnerId}
                    disabled={loadingResidents}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingResidents
                            ? "Loading residents..."
                            : "Select new owner"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {residents.map((resident) => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {resident.full_name} ({resident.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferPercentage">
                    Transfer Percentage
                  </Label>
                  <Input
                    id="transferPercentage"
                    type="number"
                    min="1"
                    max="100"
                    value={transferPercentage}
                    onChange={(e) =>
                      setTransferPercentage(Number(e.target.value))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of ownership to transfer (partial transfers
                    create co-ownership)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferDate">Transfer Date</Label>
                  <Input
                    id="transferDate"
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferReason">Reason for Transfer</Label>
                  <Select
                    value={transferReason}
                    onValueChange={setTransferReason}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="inheritance">Inheritance</SelectItem>
                      <SelectItem value="divorce">
                        Divorce Settlement
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Transfer Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details about the transfer..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="partialTransfer"
                    checked={partialTransfer}
                    onCheckedChange={(checked) =>
                      setPartialTransfer(checked as boolean)
                    }
                  />
                  <Label htmlFor="partialTransfer" className="text-sm">
                    This is a partial transfer (creates co-ownership)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirmTransfer"
                    checked={confirmTransfer}
                    onCheckedChange={(checked) =>
                      setConfirmTransfer(checked as boolean)
                    }
                    required
                  />
                  <Label htmlFor="confirmTransfer" className="text-sm">
                    I confirm that all legal documentation is in place for this
                    ownership transfer
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {isLoading ? "Transferring..." : "Transfer Ownership"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/ownership">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transfer Guidelines</CardTitle>
              <CardDescription>
                Important information about ownership transfers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Legal Requirements</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure all legal documentation (deed, purchase agreement,
                  etc.) is properly executed before processing the transfer.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Partial Transfers</h4>
                <p className="text-sm text-muted-foreground">
                  Transferring less than 100% creates a co-ownership
                  arrangement. Both parties will have ownership rights.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Financial Obligations</h4>
                <p className="text-sm text-muted-foreground">
                  Outstanding fees and assessments should be settled before
                  completing the ownership transfer.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Notification</h4>
                <p className="text-sm text-muted-foreground">
                  All relevant parties will be notified of the ownership change
                  via email after the transfer is completed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
