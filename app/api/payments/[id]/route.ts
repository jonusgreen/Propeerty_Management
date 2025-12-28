import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data, error } = await supabase.from("tenant_payments").select("*").eq("id", id).single()

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error("[v0] Error fetching payment:", error)
    return Response.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}
