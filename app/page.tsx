import { Button } from "@/components/ui/button"
import { Building2, Home, Key, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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
            <Link href="/browse">
              <Button variant="ghost">Browse Properties</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">Find Your Perfect Property</h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Connect landlords with renters and buyers. Manage properties, track rent, and streamline your property
            management all in one place.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/browse">
              <Button size="lg">Browse Properties</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline">
                List Your Property
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Everything You Need</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Property Listings</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  List and browse properties with detailed information and photos
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Admin Approval</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  All listings are reviewed and approved by administrators
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Key className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Tenant Management</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track leases, tenants, and rental agreements easily
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Rent Tracking</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Automated rent tracking and secure payment processing
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PropertyHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
