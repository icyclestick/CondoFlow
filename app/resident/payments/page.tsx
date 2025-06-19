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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, CreditCard, DollarSign } from "lucide-react";
import {
  getMyPayments,
  confirmPayment,
  getMyPaymentStats,
} from "@/lib/actions/resident/resident-payments";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getMyPayments().then(setPayments);
    getMyPaymentStats().then(setStats);
  }, [success]);

  const handlePayNow = (payment: any) => {
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

  const outstandingPayments = payments.filter(
    (p: any) => p.status === "pending" || p.status === "due"
  );
  const paidPayments = payments.filter((p: any) => p.status === "paid");

  return (
    <MainLayout userRole="resident">
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
                {stats
                  ? `$${stats.outstandingAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "-"}
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
                  ? `$${payments
                      .filter(
                        (p: any) =>
                          p.status === "paid" &&
                          new Date(p.payment_date).getMonth() ===
                            new Date().getMonth() &&
                          new Date(p.payment_date).getFullYear() ===
                            new Date().getFullYear()
                      )
                      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
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
                  ? `$${payments
                      .filter(
                        (p: any) =>
                          p.status === "paid" &&
                          new Date(p.payment_date).getFullYear() ===
                            new Date().getFullYear()
                      )
                      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
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
                        outstandingPayments.map((payment: any) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3">
                              {payment.type ||
                                payment.description ||
                                payment.payment_type ||
                                "-"}
                            </td>
                            <td className="py-3 font-medium">
                              ${payment.amount?.toFixed(2)}
                            </td>
                            <td className="py-3">
                              {payment.due_date
                                ? new Date(
                                    payment.due_date
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-3">
                              <Badge variant="outline">{payment.status}</Badge>
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
                {/* Fake Payment Modal */}
                {selectedPayment && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
                      <h2 className="text-lg font-bold mb-2">
                        Pay{" "}
                        {selectedPayment.type ||
                          selectedPayment.description ||
                          selectedPayment.payment_type ||
                          "-"}
                      </h2>
                      <div className="mb-2">
                        Amount: <b>${selectedPayment.amount?.toFixed(2)}</b>
                      </div>
                      <div className="mb-2">
                        Due:{" "}
                        {selectedPayment.due_date
                          ? new Date(
                              selectedPayment.due_date
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1 font-medium">
                          Select Payment Method:
                        </label>
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="">Choose method</option>
                          <option value="GCash">GCash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Credit Card">Credit Card</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayment(null)}
                          disabled={paying}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleConfirmPayment}
                          disabled={!paymentMethod || paying}
                        >
                          {paying ? "Processing..." : "Confirm Payment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Your payment records and receipts
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-3 text-center text-muted-foreground"
                          >
                            No payment history.
                          </td>
                        </tr>
                      ) : (
                        paidPayments.map((payment: any) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3">
                              {payment.payment_date
                                ? new Date(
                                    payment.payment_date
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-3">
                              {payment.type ||
                                payment.description ||
                                payment.payment_type ||
                                "-"}
                            </td>
                            <td className="py-3 font-medium">
                              ${payment.amount?.toFixed(2)}
                            </td>
                            <td className="py-3">
                              {payment.payment_method || "-"}
                            </td>
                            <td className="py-3">
                              <Badge variant="default">Paid</Badge>
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download
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
      </div>
    </MainLayout>
  );
}
