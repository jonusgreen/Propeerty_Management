import { createClient } from "@supabase/supabase-js"

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient()
    const { id } = params

    const { data: payment, error: paymentError } = await supabase
      .from("tenant_payments")
      .select("*")
      .eq("id", id)
      .single()

    if (paymentError || !payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 })
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select(
        "id, first_name, last_name, email, phone, currency, balance, monthly_rent, prepaid_balance, property_id, unit_id",
      )
      .eq("id", payment.tenant_id)
      .single()

    if (!tenant) {
      return Response.json({ error: "Tenant not found" }, { status: 404 })
    }

    const { data: allPayments } = await supabase
      .from("tenant_payments")
      .select("id, amount, payment_date, payment_period")
      .eq("tenant_id", payment.tenant_id)
      .lte("payment_date", payment.payment_date)
      .order("payment_date", { ascending: true })

    let balanceAtPayment = tenant?.monthly_rent || 0
    if (allPayments && allPayments.length > 0) {
      const sumOfPayments = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      balanceAtPayment = Math.max(0, (tenant?.monthly_rent || 0) - sumOfPayments)
    }

    const paymentBreakdown = []
    let remainingAmount = payment.amount
    const currentPaymentPeriod = payment.payment_period

    if (currentPaymentPeriod && remainingAmount > 0) {
      const monthlyRent = tenant?.monthly_rent || 0

      // Get outstanding balance before this payment
      const previousPayments = allPayments?.filter((p) => p.payment_date < payment.payment_date) || []
      const sumOfPreviousPayments = previousPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      const outstandingForCurrentMonth = Math.max(0, monthlyRent - sumOfPreviousPayments)

      if (outstandingForCurrentMonth > 0 && remainingAmount > 0) {
        const appliedAmount = Math.min(remainingAmount, outstandingForCurrentMonth)
        const isFullPayment =
          appliedAmount >= outstandingForCurrentMonth && remainingAmount <= outstandingForCurrentMonth
        paymentBreakdown.push({
          month: currentPaymentPeriod,
          amount: appliedAmount,
          type: isFullPayment ? "full_payment" : "partial_payment",
        })
        remainingAmount -= appliedAmount
      }

      if (remainingAmount > 0) {
        const nextMonth = new Date(currentPaymentPeriod + "-01")
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        const nextMonthStr = nextMonth.toISOString().substring(0, 7)

        paymentBreakdown.push({
          month: nextMonthStr,
          amount: remainingAmount,
          type: "overpayment_credit",
        })
      }
    }

    const propertyResult = tenant.property_id
      ? await supabase.from("properties").select("id, name").eq("id", tenant.property_id).single()
      : { data: null }

    const unitResult = tenant.unit_id
      ? await supabase
          .from("units")
          .select("id, unit_number, status, bedrooms, bathrooms, monthly_rent")
          .eq("id", tenant.unit_id)
          .single()
      : { data: null }

    console.log("[v0] Unit result:", unitResult)
    console.log("[v0] Property result:", propertyResult)

    return Response.json({
      ...payment,
      tenant: {
        ...tenant,
        balanceAtPayment,
      },
      property: propertyResult.data,
      unit: unitResult.data,
      paymentBreakdown,
    })
  } catch (error) {
    console.error("Error fetching receipt:", error)
    return Response.json({ error: "Failed to fetch receipt" }, { status: 500 })
  }
}
