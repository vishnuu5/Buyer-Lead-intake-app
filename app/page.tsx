import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getDashboardStats(userId: string) {
  const [totalLeads, newLeads, convertedLeads, recentLeads] = await Promise.all(
    [
      prisma.buyer.count({ where: { ownerId: userId } }),
      prisma.buyer.count({ where: { ownerId: userId, status: "NEW" } }),
      prisma.buyer.count({ where: { ownerId: userId, status: "CONVERTED" } }),
      prisma.buyer.count({
        where: {
          ownerId: userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]
  );

  return { totalLeads, newLeads, convertedLeads, recentLeads };
}

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/demo-login");
  }

  const stats = await getDashboardStats(user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your buyer leads and track your sales pipeline
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs text-muted-foreground">Awaiting contact</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Converted</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.convertedLeads}</div>
              <p className="text-xs text-muted-foreground">Successful sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentLeads}</div>
              <p className="text-xs text-muted-foreground">New leads</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/buyers/new">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full justify-start bg-transparent"
              >
                <Link href="/buyers">
                  <Users className="h-4 w-4 mr-2" />
                  View All Leads
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full justify-start bg-transparent"
              >
                <Link href="/buyers?status=NEW">
                  <Clock className="h-4 w-4 mr-2" />
                  New Leads to Contact
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Tips for managing your leads effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Add leads manually or import from CSV files</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>
                  Use filters to find leads by city, property type, or status
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Track lead progress through the sales pipeline</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Export filtered results for external analysis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
