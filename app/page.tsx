import { Button } from "@/components/ui/button"
import { Building2, BarChart3, Users, Wrench } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="text-xl font-bold">PropertyPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance">
            Manage your properties with confidence
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground text-pretty">
            Complete property management solution for landlords. Track tenants, manage maintenance requests, collect
            payments, and streamline operations all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Start free trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Property Management</h3>
                <p className="text-sm text-muted-foreground">
                  Organize all your properties and units in one centralized dashboard
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Tenant Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Manage tenant information, leases, and payment history effortlessly
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Maintenance Requests</h3>
                <p className="text-sm text-muted-foreground">
                  Track and resolve maintenance issues quickly and efficiently
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Financial Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor payments, expenses, and generate comprehensive reports
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 PropertyPro. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
