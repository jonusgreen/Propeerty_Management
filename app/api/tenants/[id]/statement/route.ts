import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

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
    const tenantId = params.id

    const { data: tenant, error: tenantError } = await supabase.from("tenants").select("*").eq("id", tenantId).single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    console.log("[v0] Tenant data:", { unit_id: tenant.unit_id, property_id: tenant.property_id })

    const { data: payments } = await supabase
      .from("tenant_payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("payment_date", { ascending: false })

    let property = null
    let unit = null

    if (tenant.property_id) {
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", tenant.property_id)
        .single()
      if (propertyError) {
        console.error("[v0] Property query error:", propertyError)
      }
      property = propertyData
    }

    if (tenant.unit_id) {
      const { data: unitData, error: unitError } = await supabase
        .from("units")
        .select("*")
        .eq("id", tenant.unit_id)
        .single()
      if (unitError) {
        console.error("[v0] Unit query error:", unitError)
      }
      console.log("[v0] Unit data retrieved:", unitData)
      unit = unitData
    }

    return NextResponse.json({
      tenant,
      payments: payments || [],
      property,
      unit,
    })
  } catch (error) {
    console.error("Error fetching tenant statement:", error)
    return NextResponse.json({ error: "Failed to fetch statement" }, { status: 500 })
  }
}
