"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllPayments,
  getPaymentStats,
  markPaymentAsPaid,
  generateReceipt,
} from "@/lib/actions";

interface Payment {
  id: string;
  amount: number;
  type: string;
  due_date: string;
  payment_date: string | null;
  payment_method: string | null;
  status: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
  units: {
    block: string;
    unit_number: string;
  };
}

interface PaymentStats {
  totalRevenue: number;
  outstandingAmount: number;
  collectionRate: number;
  overdueAmount: number;
  outstandingCount: number;
  overdueCount: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsData, statsData] = await Promise.all([
        getAllPayments(),
        getPaymentStats(),
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await markPaymentAsPaid(paymentId, "manual");
      toast({
        title: "Payment Updated",
        description: "The payment has been marked as paid successfully.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update payment",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReceipt = async (paymentId: string) => {
    try {
      await generateReceipt(paymentId);
      toast({
        title: "Receipt Generated",
        description: "The receipt has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate receipt",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !searchTerm ||
      payment.profiles.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${payment.units.block}${payment.units.unit_number}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || payment.status === selectedStatus;
    const matchesType = !selectedType || payment.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payment Management
            </h1>
            <p className="text-muted-foreground">
              Manage resident payments and dues
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.outstandingAmount.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                From {stats?.outstandingCount || 0} residents
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Collection Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.collectionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Current collection rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.overdueAmount.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                From {stats?.overdueCount || 0} residents
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search payments..."
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
            <option value="association-dues">Association Dues</option>
            <option value="parking">Parking Fee</option>
            <option value="utilities">Utilities</option>
            <option value="amenity">Amenity Fee</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>
                  All payment records and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Unit</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Due Date</th>
                        <th className="pb-2">Payment Date</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="py-8 text-center text-muted-foreground"
                          >
                            Loading payments...
                          </td>
                        </tr>
                      ) : filteredPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No payments found
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3">
                              <div>
                                <div className="font-medium">
                                  {payment.profiles.full_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.profiles.email}
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              {payment.units.block}-{payment.units.unit_number}
                            </td>
                            <td className="py-3">{payment.type}</td>
                            <td className="py-3 font-medium">
                              ${payment.amount.toFixed(2)}
                            </td>
                            <td className="py-3">
                              {new Date(payment.due_date).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              {payment.payment_date
                                ? new Date(
                                    payment.payment_date
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-3">
                              {payment.payment_method || "-"}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  payment.status === "paid"
                                    ? "default"
                                    : payment.status === "overdue"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                                {payment.status === "paid" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleGenerateReceipt(payment.id)
                                    }
                                  >
                                    Receipt
                                  </Button>
                                )}
                                {payment.status !== "paid" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(payment.id)}
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="outstanding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <CardDescription>
                  Payments that are pending or overdue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Filter will show only outstanding payments...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Payments</CardTitle>
                <CardDescription>
                  Payments that are past their due date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Filter will show only overdue payments...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
