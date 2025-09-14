import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import Link from "next/link";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b bg-card" role="banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2"
              aria-label="Lead Manager Home"
            >
              <Users className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold">Lead Manager</span>
            </Link>
          </div>

          <nav
            className="hidden md:flex items-center space-x-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <Button variant="ghost" asChild>
              <Link href="/buyers">All Leads</Link>
            </Button>
            <Button asChild>
              <Link href="/buyers/new">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                New Lead
              </Link>
            </Button>
          </nav>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-2">
                <span
                  className="text-sm text-muted-foreground"
                  aria-label={`Logged in as ${user.name}`}
                >
                  Welcome, {user.name}
                </span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
