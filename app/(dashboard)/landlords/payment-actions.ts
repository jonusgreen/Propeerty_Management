"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function generateLandlordReceiptNumber() {
  const supabase = getServiceClient()
  const { count } = await supabase.from("landlord_payments").select("*", { count: "exact", head: true })
  const nextNumber = (count || 0) + 1
  return `LRP-${String(nextNumber).padStart(4, "0")}`
}

export async function calculateLandlordOwed(landlordId: string, periodStart: string, periodEnd: string) {
  const supabase = getServiceClient()

  // Get all properties for this landlord
  const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", landlordId)

  if (!properties || properties.length === 0) {
    return { owed: 0, breakdown: [] }
  }

  const propertyIds = properties.map((p) => p.id)

  // Get all tenants for these properties
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, first_name, last_name, monthly_rent")
    .in("property_id", propertyIds)
    .eq("status", "active")

  if (!tenants || tenants.length === 0) {
    return { owed: 0, breakdown: [] }
  }

  const tenantIds = tenants.map((t) => t.id)

  // Get payments received from tenants during this period
  const { data: payments } = await supabase
    .from("tenant_payments")
    .select("amount")
    .in("tenant_id", tenantIds)
    .gte("payment_date", periodStart)
    .lte("payment_date", periodEnd)

  const totalCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  // Get previous payments to landlord during this period
  const { data: previousPayments } = await supabase
    .from("landlord_payments")
    .select("amount")
    .eq("landlord_id", landlordId)
    .gte("payment_date", periodStart)
    .lte("payment_date", periodEnd)

  const totalPaidToLandlord = previousPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  const owed = Math.max(0, totalCollected - totalPaidToLandlord)

  const breakdown = tenants.map((tenant) => ({
    tenant_id: tenant.id,
    tenant_name: `${tenant.first_name} ${tenant.last_name}`,
    monthly_rent: tenant.monthly_rent,
  }))

  return { owed, breakdown, totalCollected, totalPaidToLandlord }
}

export async function recordLandlordPayment(formData: FormData) {
  const supabase = getServiceClient()

  const landlord_id = formData.get("landlord_id") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const payment_date = formData.get("payment_date") as string
  const payment_method = formData.get("payment_method") as string
  const period_start = formData.get("period_start") as string
  const period_end = formData.get("period_end") as string
  const notes = formData.get("notes") as string
  const receipt_number = await generateLandlordReceiptNumber()

  const { error } = await supabase.from("landlord_payments").insert({
    landlord_id,
    amount,
    payment_date,
    payment_method,
    period_start,
    period_end,
    receipt_number,
    notes,
    status: "completed",
  })

  if (error) {
    console.error("[v0] Error recording landlord payment:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/landlords/payments")
  revalidatePath("/dashboard")

  return { success: true, receipt_number }
}

export async function getLandlordPayments(landlordId: string) {
  const supabase = getServiceClient()

  const { data: payments, error } = await supabase
    .from("landlord_payments")
    .select("*")
    .eq("landlord_id", landlordId)
    .order("payment_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching landlord payments:", error)
    return []
  }

  return payments || []
}
