import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, Plus } from "lucide-react"
import Link from "next/link"

export default async function PaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/dashboard")
  }

  let payments: any[] = []

  if (profile.role === "landlord" || profile.role === "blocker") {
    // Get payments for landlord's properties
    const { data: properties } = await supabase.from("properties").select("id").eq("landlord_id", user.id)

    const propertyIds = properties?.map((p) => p.id) || []

    const { data: paymentsData } = await supabase
      .from("rent_payments")
      .select(
        `
        *,
        properties!rent_payments_property_id_fkey(title, address)
      `,
      )
      .in("property_id", propertyIds.length > 0 ? propertyIds : [""])
      .order("due_date", { ascending: false })

    payments = paymentsData || []
  } else if (profile.role === "renter") {
    // Get payments for renter
    const { data: paymentsData } = await supabase
      .from("rent_payments")
      .select(
        `
        *,
        properties!rent_payments_property_id_fkey(title, address)
      `,
      )
      .eq("renter_id", user.id)
      .order("due_date", { ascending: false })

    payments = paymentsData || []
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
            {(profile.role === "landlord" || profile.role === "blocker") && (
              <Link href="/dashboard/properties">
                <Button variant="ghost">My Properties</Button>
              </Link>
            )}
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect("/")
              }}
            >
              <Button variant="ghost" type="submit">
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Rent Payments</h1>
              <p className="text-muted-foreground">
                {profile.role === "landlord" || profile.role === "blocker"
                  ? "Track rent payments for your properties"
                  : "View and pay your rent"}
              </p>
            </div>
            {(profile.role === "landlord" || profile.role === "blocker") && (
              <Link href="/dashboard/payments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment
                </Button>
              </Link>
            )}
          </div>

          {payments && payments.length > 0 ? (
            <div className="grid gap-6">
              {payments.map((payment: any) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{payment.properties.title}</CardTitle>
                          <Badge
                            variant={
                              payment.status === "paid"
                                ? "default"
                                : payment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">{payment.properties.address}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Amount:</span>
                          </div>
                          <span className="text-lg font-bold">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Due Date:</span>
                          </div>
                          <span className="font-medium">{new Date(payment.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {payment.paid_date && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Paid Date:</span>
                            </div>
                            <span className="font-medium">{new Date(payment.paid_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {payment.stripe_payment_id && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Payment ID:</span>
                            <span className="font-mono text-xs">{payment.stripe_payment_id.slice(0, 20)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {profile.role === "renter" && payment.status === "pending" && (
                      <div className="mt-4">
                        <Link href={`/dashboard/payments/${payment.id}/pay`}>
                          <Button className="w-full">Pay Now</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No payments yet</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.role === "landlord" || profile.role === "blocker"
                    ? "Add payment records for your properties"
                    : "No rent payments are due at this time"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
