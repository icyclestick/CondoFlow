"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function TransferOwnershipPage({userName, userRole}: {userName: string, userRole: "admin" | "resident"}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement transfer ownership logic
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
                  <Label htmlFor="unit">Select Unit</Label>
                  <Select name="unit" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a unit to transfer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a-101">
                        Block A, Unit 101 - John Smith (100%)
                      </SelectItem>
                      <SelectItem value="a-102">
                        Block A, Unit 102 - Sarah Johnson (100%)
                      </SelectItem>
                      <SelectItem value="b-201">
                        Block B, Unit 201 - Alice Brown (60%), Bob Wilson (40%)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-owner">Current Owner</Label>
                  <Select name="current-owner" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john-smith">
                        John Smith (100%)
                      </SelectItem>
                      <SelectItem value="sarah-johnson">
                        Sarah Johnson (100%)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-owner">New Owner</Label>
                  <Select name="new-owner" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new owner or add new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mike-davis">
                        Mike Davis (Existing Resident)
                      </SelectItem>
                      <SelectItem value="lisa-chen">
                        Lisa Chen (Existing Resident)
                      </SelectItem>
                      <SelectItem value="new-owner">+ Add New Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-percentage">
                    Transfer Percentage
                  </Label>
                  <Input
                    id="transfer-percentage"
                    name="transfer-percentage"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue="100"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of ownership to transfer (partial transfers
                    create co-ownership)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-date">Transfer Date</Label>
                  <Input
                    id="transfer-date"
                    name="transfer-date"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-reason">Reason for Transfer</Label>
                  <Select name="transfer-reason" required>
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
                    name="notes"
                    placeholder="Additional details about the transfer..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="confirm-transfer" required />
                  <Label htmlFor="confirm-transfer" className="text-sm">
                    I confirm that all legal documentation is in place for this
                    ownership transfer
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
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
