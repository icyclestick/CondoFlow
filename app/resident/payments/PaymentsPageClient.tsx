"use client";

import { useState, useEffect } from "react";
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
import { Download, CreditCard, DollarSign, Receipt } from "lucide-react";
import {
  getMyPayments,
  confirmPayment,
  getMyPaymentStats,
  getPaymentReceipt,
} from "@/lib/actions/resident/resident-payments";

// Type definitions
interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  due_date: string;
  payment_date: string | null;
  payment_method: string | null;
  status: string;
  description?: string;
  units: {
    block: string;
    unit_number: string;
  };
}

interface PaymentStats {
  totalPaid: number;
  outstandingAmount: number;
  overdueAmount: number;
  outstandingCount: number;
  overdueCount: number;
  totalPayments: number;
}

const PAYMENT_METHODS = [
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "credit-card", label: "Credit Card" },
  { value: "debit-card", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "online-payment", label: "Online Payment" },
];

// Format currency in Philippine Peso
const formatCurrency = (amount: number) => {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function PaymentsPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showReceipt, setShowReceipt] = useState<Payment | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [success]);

  const fetchData = async () => {
    try {
      const [paymentsData, statsData] = await Promise.all([
        getMyPayments(),
        getMyPaymentStats(),
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
  };

  const handlePayNow = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentMethod("");
    setError("");
    setSuccess("");
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment || !paymentMethod) return;
    setPaying(true);
    setError("");
    setSuccess("");
    try {
      await confirmPayment(selectedPayment.id, paymentMethod);
      setSuccess("Payment successful!");
      setSelectedPayment(null);
    } catch (err: any) {
      setError(err.message || "Failed to process payment.");
    } finally {
      setPaying(false);
    }
  };

  const handleViewReceipt = async (payment: Payment) => {
    try {
      const receipt = await getPaymentReceipt(payment.id);
      setReceiptData(receipt);
      setShowReceipt(payment);
    } catch (err: any) {
      setError(err.message || "Failed to load receipt.");
    }
  };

  const outstandingPayments = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
  const paidPayments = payments.filter((p) => p.status === "paid");

  return (
    <MainLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            View and manage your payments and dues
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? formatCurrency(stats.outstandingAmount) : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats && stats.outstandingCount > 0
                  ? `${stats.outstandingCount} payment(s) due`
                  : "No outstanding payments"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats
                  ? formatCurrency(
                      payments
                        .filter(
                          (p) =>
                            p.status === "paid" &&
                            new Date(p.payment_date!).getMonth() ===
                              new Date().getMonth() &&
                            new Date(p.payment_date!).getFullYear() ===
                              new Date().getFullYear()
                        )
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                    )
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">Paid this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Year to Date
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats
                  ? formatCurrency(
                      payments
                        .filter(
                          (p) =>
                            p.status === "paid" &&
                            new Date(p.payment_date!).getFullYear() ===
                              new Date().getFullYear()
                        )
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                    )
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Total paid this year
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="outstanding">
          <TabsList>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>
          <TabsContent value="outstanding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <CardDescription>
                  Payments that are due or overdue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                {success && (
                  <div className="text-green-600 mb-2">{success}</div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
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
                            colSpan={5}
                            className="py-3 text-center text-muted-foreground"
                          >
                            No outstanding payments.
                          </td>
                        </tr>
                      ) : (
                        outstandingPayments.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3">
                              <div>
                                <div className="font-medium">
                                  {payment.payment_type || "-"}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-medium">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-3">
                              {payment.due_date
                                ? new Date(
                                    payment.due_date
                                  ).toLocaleDateString()
                                : "-"}
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
                              <Button
                                size="sm"
                                onClick={() => handlePayNow(payment)}
                                disabled={
                                  paying && selectedPayment?.id === payment.id
                                }
                              >
                                {paying && selectedPayment?.id === payment.id
                                  ? "Processing..."
                                  : "Pay"}
                              </Button>
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

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Your completed payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Payment Date</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-3 text-center text-muted-foreground"
                          >
                            No payment history found.
                          </td>
                        </tr>
                      ) : (
                        paidPayments.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3">
                              <div>
                                <div className="font-medium">
                                  {payment.payment_type || "-"}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-medium">
                              {formatCurrency(payment.amount)}
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
                              <Badge variant="default">{payment.status}</Badge>
                            </td>
                            <td className="py-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewReceipt(payment)}
                              >
                                <Receipt className="mr-2 h-4 w-4" />
                                Receipt
                              </Button>
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
        </Tabs>

        {/* Payment Modal */}
        {selectedPayment && (
          <Dialog
            open={!!selectedPayment}
            onOpenChange={() => setSelectedPayment(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Make Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Payment Type:</span>
                    <span>{selectedPayment.payment_type || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Amount:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Due Date:</span>
                    <span>
                      {selectedPayment.due_date
                        ? new Date(
                            selectedPayment.due_date
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method:</Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a payment method</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && (
                  <div className="text-green-600 text-sm">{success}</div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPayment(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={paying || !paymentMethod}
                >
                  {paying ? "Processing..." : "Confirm Payment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Receipt Modal */}
        {showReceipt && receiptData && (
          <Dialog
            open={!!showReceipt}
            onOpenChange={() => setShowReceipt(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Payment Receipt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold">Payment Receipt</h3>
                    <p className="text-sm text-muted-foreground">
                      Receipt #{receiptData.id}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Payment Type:</span>
                      <span>{receiptData.payment_type || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold">
                        {formatCurrency(receiptData.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Date:</span>
                      <span>
                        {receiptData.payment_date
                          ? new Date(
                              receiptData.payment_date
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>{receiptData.payment_method || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit:</span>
                      <span>
                        Block {receiptData.units?.block} - Unit{" "}
                        {receiptData.units?.unit_number}
                      </span>
                    </div>
                    {receiptData.description && (
                      <div className="flex justify-between">
                        <span>Description:</span>
                        <span>{receiptData.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReceipt(null)}>
                  Close
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
