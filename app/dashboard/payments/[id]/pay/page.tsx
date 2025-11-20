import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RentPaymentCheckout } from "@/components/rent-payment-checkout"

export default async function PayRentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: payment } = await supabase
    .from("rent_payments")
    .select(
      `
      *,
      tenants!rent_payments_tenant_id_fkey(
        renter_id,
        properties!tenants_property_id_fkey(title, address, city, state)
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!payment) {
    notFound()
  }

  // Check if user is the renter
  if (payment.tenants.renter_id !== user.id) {
    redirect("/dashboard/payments")
  }

  // Check if already paid
  if (payment.status === "paid") {
    redirect("/dashboard/payments")
  }

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="text-xl font-semibold">PropertyHub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/dashboard/payments">
              <Button variant="ghost">Payments</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Pay Rent</h1>
            <p className="text-muted-foreground">Complete your rent payment securely</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Review your payment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Property:</span>
                    <p className="font-medium">{payment.tenants.properties.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.tenants.properties.address}, {payment.tenants.properties.city},{" "}
                      {payment.tenants.properties.state}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <span className="text-sm text-muted-foreground">Due Date:</span>
                    <p className="font-medium">{new Date(payment.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className="border-t pt-4">
                    <span className="text-sm text-muted-foreground">Amount Due:</span>
                    <p className="text-2xl font-bold">${payment.amount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Enter your payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <RentPaymentCheckout paymentId={id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
