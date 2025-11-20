import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/lib/types"
import { UserRoleActions } from "@/components/user-role-actions"

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  let query = supabase.from("profiles").select("*")

  if (role) {
    query = query.eq("role", role)
  }

  const { data: users } = await query.order("created_at", { ascending: false })

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="text-xl font-semibold">PropertyHub Admin</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost">Admin Dashboard</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage users and assign roles</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2">
            <Link href="/admin/users">
              <Button variant={!role ? "default" : "outline"}>All Users</Button>
            </Link>
            <Link href="/admin/users?role=admin">
              <Button variant={role === "admin" ? "default" : "outline"}>Admins</Button>
            </Link>
            <Link href="/admin/users?role=landlord">
              <Button variant={role === "landlord" ? "default" : "outline"}>Landlords</Button>
            </Link>
            <Link href="/admin/users?role=blocker">
              <Button variant={role === "blocker" ? "default" : "outline"}>Blockers</Button>
            </Link>
            <Link href="/admin/users?role=renter">
              <Button variant={role === "renter" ? "default" : "outline"}>Renters</Button>
            </Link>
          </div>

          {users && users.length > 0 ? (
            <div className="grid gap-4">
              {users.map((userProfile: Profile) => (
                <Card key={userProfile.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{userProfile.full_name || "No name"}</CardTitle>
                          <Badge
                            variant={
                              userProfile.role === "admin"
                                ? "default"
                                : userProfile.role === "landlord"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {userProfile.role}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {userProfile.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{userProfile.phone || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Joined:</span>
                        <span className="font-medium">{new Date(userProfile.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {userProfile.id !== user.id && (
                      <div className="mt-4">
                        <UserRoleActions userId={userProfile.id} currentRole={userProfile.role} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="mb-2 text-lg font-semibold">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  {role ? `No ${role}s found` : "No users have registered yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
