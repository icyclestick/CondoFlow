import Link from "next/link"
import { Building } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="text-xl font-bold">CondoFlow</span>
          </div>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-slate-50 py-24 text-center">
          <div className="container">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Welcome to CondoFlow</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              The complete management solution for your condominium
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/auth/signin">Access Your Account</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container">
            <h2 className="mb-8 text-center text-3xl font-bold">Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
                <h3 className="mb-2 text-xl font-bold">Resident Management</h3>
                <p className="text-muted-foreground">
                  Easily manage resident information, unit assignments, and contact details.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
                <h3 className="mb-2 text-xl font-bold">Amenity Booking</h3>
                <p className="text-muted-foreground">Streamlined booking system for all community amenities.</p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
                <h3 className="mb-2 text-xl font-bold">Maintenance Requests</h3>
                <p className="text-muted-foreground">
                  Efficient tracking and management of service and maintenance requests.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-slate-50 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CondoFlow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
