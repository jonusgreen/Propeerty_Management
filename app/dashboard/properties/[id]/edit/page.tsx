import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { PropertyForm } from "@/components/property-form"
import { Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: property } = await supabase.from("properties").select("*").eq("id", id).single()

  if (!property) {
    notFound()
  }

  // Check if user owns this property
  if (property.landlord_id !== user.id) {
    redirect("/dashboard/properties")
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
            <Link href="/dashboard/properties">
              <Button variant="ghost">My Properties</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Property</h1>
            <p className="text-muted-foreground">Update your property details</p>
          </div>

          <PropertyForm userId={user.id} property={property} />
        </div>
      </main>
    </div>
  )
}
