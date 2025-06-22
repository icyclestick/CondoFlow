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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Download,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllPayments,
  getPaymentStats,
  markPaymentAsPaid,
  generateReceipt,
  createPayment,
  createBulkPayments,
  getAllUnits,
  getAllResidents,
  deletePayment,
} from "@/lib/actions/admin/admin-payments";

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
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

interface Unit {
  id: string;
  block: string;
  unit_number: string;
  status: string;
  monthly_fee?: number;
}

interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

export default function AdminPaymentsPage({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Form states for single payment creation
  const [singlePaymentForm, setSinglePaymentForm] = useState({
    userId: "",
    unitId: "",
    amount: "",
    type: "",
    dueDate: "",
    description: "",
  });

  // Form states for bulk payment creation
  const [bulkPaymentForm, setBulkPaymentForm] = useState({
    unitIds: [] as string[],
    amount: "",
    type: "",
    dueDate: "",
    description: "",
    searchTerm: "",
    statusFilter: "",
    useIndividualFees: false,
  });

  // State for individual unit fees
  const [individualFees, setIndividualFees] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsData, statsData, unitsData, residentsData] =
        await Promise.all([
          getAllPayments(),
          getPaymentStats(),
          getAllUnits(),
          getAllResidents(),
        ]);
      setPayments(paymentsData);
      setStats(statsData);
      setUnits(unitsData);
      setResidents(residentsData);
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

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    setIsDeleting(paymentId);
    try {
      await deletePayment(paymentId);
      toast({
        title: "Payment Deleted",
        description: "The payment has been deleted successfully.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete payment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
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

  const handleCreateSinglePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("userId", singlePaymentForm.userId);
      formData.append("unitId", singlePaymentForm.unitId);
      formData.append("amount", singlePaymentForm.amount);
      formData.append("type", singlePaymentForm.type);
      formData.append("dueDate", singlePaymentForm.dueDate);
      formData.append("description", singlePaymentForm.description);

      await createPayment(formData);
      toast({
        title: "Payment Created",
        description: "The payment has been created successfully.",
      });
      setShowCreateModal(false);
      setSinglePaymentForm({
        userId: "",
        unitId: "",
        amount: "",
        type: "",
        dueDate: "",
        description: "",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create payment",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateBulkPayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // For monthly dues with individual fees, we need to create payments one by one
      if (
        bulkPaymentForm.type === "monthly-dues" &&
        bulkPaymentForm.useIndividualFees
      ) {
        // Create individual payments for each unit with their specific fee
        const paymentPromises = bulkPaymentForm.unitIds.map(async (unitId) => {
          const unit = units.find((u) => u.id === unitId);
          const amount = individualFees[unitId] || unit?.monthly_fee || 0;

          const formData = new FormData();
          formData.append("userId", ""); // Will be set by the backend based on unit residency
          formData.append("unitId", unitId);
          formData.append("amount", amount.toString());
          formData.append("type", bulkPaymentForm.type);
          formData.append("dueDate", bulkPaymentForm.dueDate);
          formData.append("description", bulkPaymentForm.description);

          return createPayment(formData);
        });

        const results = await Promise.allSettled(paymentPromises);
        const successful = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        let message = `Successfully created ${successful} payment(s)`;
        if (failed > 0) {
          message += `. Failed to create ${failed} payment(s) (units without residents).`;
        }

        toast({
          title: "Bulk Payments Created",
          description: message,
        });
      } else {
        // Use the existing bulk payment logic for other payment types
        const result = await createBulkPayments({
          unit_ids: bulkPaymentForm.unitIds,
          amount: Number.parseFloat(bulkPaymentForm.amount),
          type: bulkPaymentForm.type,
          due_date: bulkPaymentForm.dueDate,
          description: bulkPaymentForm.description,
        });

        toast({
          title: "Bulk Payments Created",
          description:
            result.summary ||
            "The bulk payments have been created successfully.",
        });
      }
      setShowBulkModal(false);
      setBulkPaymentForm({
        unitIds: [],
        amount: "",
        type: "",
        dueDate: "",
        description: "",
        searchTerm: "",
        statusFilter: "",
        useIndividualFees: false,
      });
      setIndividualFees({});
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create bulk payments",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
    const matchesType = !selectedType || payment.payment_type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const outstandingPayments = filteredPayments.filter(
    (payment) => payment.status === "pending" || payment.status === "overdue"
  );

  const overduePayments = filteredPayments.filter(
    (payment) => payment.status === "overdue"
  );

  // Calculate total amount based on payment type and individual fees
  const calculateTotalAmount = () => {
    if (
      bulkPaymentForm.type === "monthly-dues" &&
      bulkPaymentForm.useIndividualFees
    ) {
      return bulkPaymentForm.unitIds.reduce((total, unitId) => {
        return total + (individualFees[unitId] || 0);
      }, 0);
    } else {
      return (
        Number.parseFloat(bulkPaymentForm.amount || "0") *
        bulkPaymentForm.unitIds.length
      );
    }
  };

  // Get unique fee amounts for display
  const getUniqueFeeAmounts = () => {
    if (
      bulkPaymentForm.type !== "monthly-dues" ||
      !bulkPaymentForm.useIndividualFees
    ) {
      return [];
    }

    const fees = bulkPaymentForm.unitIds.map(
      (unitId) => individualFees[unitId] || 0
    );
    const uniqueFees = [...new Set(fees)].sort((a, b) => a - b);

    return uniqueFees.map((fee) => ({
      amount: fee,
      count: fees.filter((f) => f === fee).length,
      units: bulkPaymentForm.unitIds.filter(
        (unitId) => individualFees[unitId] === fee
      ),
    }));
  };

  // Format currency in Philippine Peso
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Handle payment type change
  const handlePaymentTypeChange = (type: string) => {
    setBulkPaymentForm({
      ...bulkPaymentForm,
      type,
      useIndividualFees: type === "monthly-dues",
    });

    // If switching to monthly dues, populate individual fees
    if (type === "monthly-dues") {
      const fees: Record<string, number> = {};
      bulkPaymentForm.unitIds.forEach((unitId) => {
        const unit = units.find((u) => u.id === unitId);
        fees[unitId] = unit?.monthly_fee || 0;
      });
      setIndividualFees(fees);
    }
  };

  // Handle unit selection change
  const handleUnitSelectionChange = (unitId: string, isSelected: boolean) => {
    let newUnitIds;
    if (isSelected) {
      newUnitIds = [...bulkPaymentForm.unitIds, unitId];
    } else {
      newUnitIds = bulkPaymentForm.unitIds.filter((id) => id !== unitId);
    }

    setBulkPaymentForm({
      ...bulkPaymentForm,
      unitIds: newUnitIds,
    });

    // Update individual fees for monthly dues
    if (
      bulkPaymentForm.type === "monthly-dues" &&
      bulkPaymentForm.useIndividualFees
    ) {
      const newFees = { ...individualFees };
      if (isSelected) {
        const unit = units.find((u) => u.id === unitId);
        newFees[unitId] = unit?.monthly_fee || 0;
      } else {
        delete newFees[unitId];
      }
      setIndividualFees(newFees);
    }
  };

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
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
            <Button variant="outline" onClick={() => setShowBulkModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Bulk Payments
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Payment
            </Button>
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
                {formatCurrency(stats?.totalRevenue || 0)}
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
                {formatCurrency(stats?.outstandingAmount || 0)}
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
                {formatCurrency(stats?.overdueAmount || 0)}
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
            <option value="monthly-dues">Monthly Dues</option>
            <option value="parking">Parking Fee</option>
            <option value="utilities">Utilities</option>
            <option value="amenity">Amenity Fee</option>
            <option value="special-assessment">Special Assessment</option>
            <option value="late-fee">Late Fee</option>
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
                            <td className="py-3">{payment.payment_type}</td>
                            <td className="py-3 font-medium">
                              {formatCurrency(payment.amount)}
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
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeletePayment(payment.id)
                                  }
                                  disabled={isDeleting === payment.id}
                                >
                                  {isDeleting === payment.id ? (
                                    "Deleting..."
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Unit</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Due Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outstandingPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No outstanding payments found
                          </td>
                        </tr>
                      ) : (
                        outstandingPayments.map((payment) => (
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
                            <td className="py-3">{payment.payment_type}</td>
                            <td className="py-3 font-medium">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-3">
                              {new Date(payment.due_date).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  payment.status === "overdue"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                >
                                  Mark Paid
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeletePayment(payment.id)
                                  }
                                  disabled={isDeleting === payment.id}
                                >
                                  {isDeleting === payment.id ? (
                                    "Deleting..."
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
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
          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Payments</CardTitle>
                <CardDescription>
                  Payments that are past their due date
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
                        <th className="pb-2">Days Overdue</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overduePayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No overdue payments found
                          </td>
                        </tr>
                      ) : (
                        overduePayments.map((payment) => {
                          const daysOverdue = Math.ceil(
                            (new Date().getTime() -
                              new Date(payment.due_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return (
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
                                {payment.units.block}-
                                {payment.units.unit_number}
                              </td>
                              <td className="py-3">{payment.payment_type}</td>
                              <td className="py-3 font-medium">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="py-3">
                                {new Date(
                                  payment.due_date
                                ).toLocaleDateString()}
                              </td>
                              <td className="py-3">
                                <Badge variant="destructive">
                                  {daysOverdue} days
                                </Badge>
                              </td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(payment.id)}
                                  >
                                    Mark Paid
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeletePayment(payment.id)
                                    }
                                    disabled={isDeleting === payment.id}
                                  >
                                    {isDeleting === payment.id ? (
                                      "Deleting..."
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Single Payment Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSinglePayment} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="resident">Resident</Label>
                  <select
                    id="resident"
                    required
                    value={singlePaymentForm.userId}
                    onChange={(e) =>
                      setSinglePaymentForm({
                        ...singlePaymentForm,
                        userId: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a resident</option>
                    {residents.map((resident) => (
                      <option key={resident.id} value={resident.id}>
                        {resident.full_name} ({resident.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    required
                    value={singlePaymentForm.unitId}
                    onChange={(e) =>
                      setSinglePaymentForm({
                        ...singlePaymentForm,
                        unitId: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        Block {unit.block} - Unit {unit.unit_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={singlePaymentForm.amount}
                    onChange={(e) =>
                      setSinglePaymentForm({
                        ...singlePaymentForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Payment Type</Label>
                  <select
                    id="type"
                    required
                    value={singlePaymentForm.type}
                    onChange={(e) =>
                      setSinglePaymentForm({
                        ...singlePaymentForm,
                        type: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select payment type</option>
                    <option value="monthly-dues">Monthly Dues</option>
                    <option value="parking">Parking Fee</option>
                    <option value="utilities">Utilities</option>
                    <option value="amenity">Amenity Fee</option>
                    <option value="special-assessment">
                      Special Assessment
                    </option>
                    <option value="late-fee">Late Fee</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  required
                  value={singlePaymentForm.dueDate}
                  onChange={(e) =>
                    setSinglePaymentForm({
                      ...singlePaymentForm,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={singlePaymentForm.description}
                  onChange={(e) =>
                    setSinglePaymentForm({
                      ...singlePaymentForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Payment description"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Bulk Payments Modal */}
        <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Bulk Payments</DialogTitle>
              <CardDescription>
                Create payments for multiple units at once. Perfect for monthly
                dues and assessments.
              </CardDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBulkPayments} className="space-y-6">
              {/* Quick Selection Controls */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Quick Selection</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allUnitIds = units.map((unit) => unit.id);
                        setBulkPaymentForm({
                          ...bulkPaymentForm,
                          unitIds: allUnitIds,
                        });
                      }}
                    >
                      Select All Units
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkPaymentForm({
                          ...bulkPaymentForm,
                          unitIds: [],
                        });
                      }}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const occupiedUnits = units
                          .filter((unit) => unit.status === "occupied")
                          .map((unit) => unit.id);
                        setBulkPaymentForm({
                          ...bulkPaymentForm,
                          unitIds: occupiedUnits,
                        });
                      }}
                    >
                      Occupied Units Only
                    </Button>
                  </div>
                </div>

                {/* Block Selection */}
                <div>
                  <Label className="text-sm font-medium">Select by Block</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(new Set(units.map((unit) => unit.block)))
                      .sort()
                      .map((block) => (
                        <Button
                          key={block}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blockUnits = units
                              .filter((unit) => unit.block === block)
                              .map((unit) => unit.id);
                            const currentBlockUnits =
                              bulkPaymentForm.unitIds.filter(
                                (id) =>
                                  units.find((unit) => unit.id === id)
                                    ?.block === block
                              );

                            if (
                              currentBlockUnits.length === blockUnits.length
                            ) {
                              // If all units in block are selected, deselect them
                              setBulkPaymentForm({
                                ...bulkPaymentForm,
                                unitIds: bulkPaymentForm.unitIds.filter(
                                  (id) =>
                                    units.find((unit) => unit.id === id)
                                      ?.block !== block
                                ),
                              });
                            } else {
                              // Select all units in block
                              const newUnitIds = [...bulkPaymentForm.unitIds];
                              blockUnits.forEach((unitId) => {
                                if (!newUnitIds.includes(unitId)) {
                                  newUnitIds.push(unitId);
                                }
                              });
                              setBulkPaymentForm({
                                ...bulkPaymentForm,
                                unitIds: newUnitIds,
                              });
                            }
                          }}
                          className={
                            units
                              .filter((unit) => unit.block === block)
                              .every((unit) =>
                                bulkPaymentForm.unitIds.includes(unit.id)
                              )
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }
                        >
                          Block {block} (
                          {units.filter((unit) => unit.block === block).length}{" "}
                          units)
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="unit-search">Search Units</Label>
                    <Input
                      id="unit-search"
                      placeholder="Search by block or unit number..."
                      onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        // This will be used to filter the units list
                        const filteredUnits = units.filter((unit) =>
                          `${unit.block}${unit.unit_number}`
                            .toLowerCase()
                            .includes(searchTerm)
                        );
                        // For now, we'll just store the search term and filter in the render
                        setBulkPaymentForm({
                          ...bulkPaymentForm,
                          searchTerm: searchTerm,
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <select
                      id="status-filter"
                      onChange={(e) => {
                        setBulkPaymentForm({
                          ...bulkPaymentForm,
                          statusFilter: e.target.value,
                        });
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Statuses</option>
                      <option value="occupied">Occupied</option>
                      <option value="vacant">Vacant</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Selection Summary */}
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Selected: {bulkPaymentForm.unitIds.length} of{" "}
                      {units.length} units
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Total Amount: {formatCurrency(calculateTotalAmount())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Units Selection Grid */}
              <div className="space-y-2">
                <Label>Select Units</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-4 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {units
                      .filter((unit) => {
                        const matchesSearch =
                          !bulkPaymentForm.searchTerm ||
                          `${unit.block}${unit.unit_number}`
                            .toLowerCase()
                            .includes(bulkPaymentForm.searchTerm.toLowerCase());
                        const matchesStatus =
                          !bulkPaymentForm.statusFilter ||
                          unit.status === bulkPaymentForm.statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((unit) => (
                        <label
                          key={unit.id}
                          className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                            bulkPaymentForm.unitIds.includes(unit.id)
                              ? "bg-primary/10 border-primary"
                              : "bg-background border-border hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={bulkPaymentForm.unitIds.includes(unit.id)}
                            onChange={(e) => {
                              handleUnitSelectionChange(
                                unit.id,
                                e.target.checked
                              );
                            }}
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              Block {unit.block} - Unit {unit.unit_number}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {unit.status}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                  {units.filter((unit) => {
                    const matchesSearch =
                      !bulkPaymentForm.searchTerm ||
                      `${unit.block}${unit.unit_number}`
                        .toLowerCase()
                        .includes(bulkPaymentForm.searchTerm.toLowerCase());
                    const matchesStatus =
                      !bulkPaymentForm.statusFilter ||
                      unit.status === bulkPaymentForm.statusFilter;
                    return matchesSearch && matchesStatus;
                  }).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No units found matching your criteria
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bulk-amount">
                    {bulkPaymentForm.type === "monthly-dues" &&
                    bulkPaymentForm.useIndividualFees
                      ? "Default Amount per Unit"
                      : "Amount per Unit"}
                  </Label>
                  <Input
                    id="bulk-amount"
                    type="number"
                    step="0.01"
                    required={
                      bulkPaymentForm.type !== "monthly-dues" ||
                      !bulkPaymentForm.useIndividualFees
                    }
                    value={bulkPaymentForm.amount}
                    onChange={(e) =>
                      setBulkPaymentForm({
                        ...bulkPaymentForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    disabled={
                      bulkPaymentForm.type === "monthly-dues" &&
                      bulkPaymentForm.useIndividualFees
                    }
                  />
                  {bulkPaymentForm.type === "monthly-dues" && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useIndividualFees"
                        checked={bulkPaymentForm.useIndividualFees}
                        onChange={(e) => {
                          setBulkPaymentForm({
                            ...bulkPaymentForm,
                            useIndividualFees: e.target.checked,
                          });
                          if (e.target.checked) {
                            // Populate individual fees for all units
                            const fees: Record<string, number> = {};
                            units.forEach((unit) => {
                              fees[unit.id] = unit.monthly_fee || 0;
                            });
                            setIndividualFees(fees);
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="useIndividualFees" className="text-sm">
                        Use individual unit monthly fees
                      </Label>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-type">Payment Type</Label>
                  <select
                    id="bulk-type"
                    required
                    value={bulkPaymentForm.type}
                    onChange={(e) => {
                      handlePaymentTypeChange(e.target.value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select payment type</option>
                    <option value="monthly-dues">Monthly Dues</option>
                    <option value="parking">Parking Fee</option>
                    <option value="utilities">Utilities</option>
                    <option value="amenity">Amenity Fee</option>
                    <option value="special-assessment">
                      Special Assessment
                    </option>
                    <option value="late-fee">Late Fee</option>
                  </select>
                </div>
              </div>

              {/* Individual Fee Breakdown */}
              {bulkPaymentForm.type === "monthly-dues" &&
                bulkPaymentForm.useIndividualFees &&
                getUniqueFeeAmounts().length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fee Breakdown</Label>
                    <div className="bg-muted/20 border rounded-lg p-4">
                      <div className="space-y-2">
                        {getUniqueFeeAmounts().map((feeGroup, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>
                              {formatCurrency(feeGroup.amount)} ×{" "}
                              {feeGroup.count} unit
                              {feeGroup.count !== 1 ? "s" : ""}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(feeGroup.amount * feeGroup.count)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between items-center font-medium">
                            <span>Total:</span>
                            <span>
                              {formatCurrency(calculateTotalAmount())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Debug info - remove this later */}
                    <div className="text-xs text-muted-foreground">
                      Debug: {bulkPaymentForm.unitIds.length} units selected,{" "}
                      {Object.keys(individualFees).length} fees loaded
                    </div>
                  </div>
                )}

              <div className="space-y-2">
                <Label htmlFor="bulk-dueDate">Due Date</Label>
                <Input
                  id="bulk-dueDate"
                  type="date"
                  required
                  value={bulkPaymentForm.dueDate}
                  onChange={(e) =>
                    setBulkPaymentForm({
                      ...bulkPaymentForm,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-description">Description (Optional)</Label>
                <Input
                  id="bulk-description"
                  value={bulkPaymentForm.description}
                  onChange={(e) =>
                    setBulkPaymentForm({
                      ...bulkPaymentForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Payment description (e.g., 'January 2024 Monthly Dues')"
                />
              </div>

              {/* Final Summary */}
              {bulkPaymentForm.unitIds.length > 0 && bulkPaymentForm.amount && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Units Selected:</span>
                      <span>{bulkPaymentForm.unitIds.length} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount per Unit:</span>
                      <span>
                        {formatCurrency(
                          Number.parseFloat(bulkPaymentForm.amount)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Type:</span>
                      <span className="capitalize">
                        {bulkPaymentForm.type.replace("-", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span>
                        {bulkPaymentForm.dueDate
                          ? new Date(
                              bulkPaymentForm.dueDate
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(calculateTotalAmount())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isCreating ||
                    bulkPaymentForm.unitIds.length === 0 ||
                    (!bulkPaymentForm.amount &&
                      !(
                        bulkPaymentForm.type === "monthly-dues" &&
                        bulkPaymentForm.useIndividualFees
                      )) ||
                    !bulkPaymentForm.type ||
                    !bulkPaymentForm.dueDate
                  }
                >
                  {isCreating
                    ? "Creating..."
                    : `Create ${bulkPaymentForm.unitIds.length} Payment${
                        bulkPaymentForm.unitIds.length !== 1 ? "s" : ""
                      }`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
