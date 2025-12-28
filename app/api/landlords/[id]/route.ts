import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const { data, error } = await supabase.from("owners").select("*").eq("id", params.id).single()

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 })
  }

  return Response.json({ success: true, data })
}
