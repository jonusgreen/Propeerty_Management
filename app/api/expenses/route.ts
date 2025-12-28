import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: expenses, error } = await supabase
    .from("transactions")
    .select("id, amount, currency, category, transaction_date, description, property_id")
    .eq("type", "expense")
    .order("transaction_date", { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Fetch property details
  const propertyIds = [...new Set(expenses?.map((e: any) => e.property_id).filter(Boolean))]
  const { data: properties } = await supabase.from("properties").select("id, name").in("id", propertyIds)

  const propertiesMap = new Map(properties?.map((p) => [p.id, p]) || [])

  const enrichedExpenses = expenses?.map((expense: any) => ({
    ...expense,
    property: expense.property_id ? propertiesMap.get(expense.property_id) : null,
  }))

  return Response.json(enrichedExpenses || [])
}
