import { Suspense } from "react";
import { prisma } from "@/lib/database";
import { requireAuth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { BuyersFilters } from "@/components/buyers/buyers-filters";
import { BuyersTable } from "@/components/buyers/buyers-table";
import { Pagination } from "@/components/buyers/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Download, Upload } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  page?: string;
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
}

async function getBuyers(userId: string, searchParams: Promise<SearchParams>) {
  const params = await searchParams;
  const page = Number.parseInt(params.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { ownerId: userId };

  if (params.city && params.city !== "All cities") where.city = params.city;
  if (params.propertyType && params.propertyType !== "All types") where.propertyType = params.propertyType;
  if (params.status && params.status !== "All statuses") where.status = params.status;
  if (params.timeline && params.timeline !== "All timelines") where.timeline = params.timeline;

  if (params.search) {
    where.OR = [
      { fullName: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
      { phone: { contains: params.search } },
    ];
  }

  const [buyers, total] = await Promise.all([
    prisma.buyer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        propertyType: true,
        bhk: true,
        purpose: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.buyer.count({ where }),
  ]);

  return {
    buyers: buyers.map(buyer => ({
      ...buyer,
      email: buyer.email || undefined,
      bhk: buyer.bhk || undefined,
      budgetMin: buyer.budgetMin || undefined,
      budgetMax: buyer.budgetMax || undefined,
      updatedAt: buyer.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

function BuyersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function BuyersContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireAuth();
  const { buyers, pagination } = await getBuyers(user.id, searchParams);

  return (
    <>
      <BuyersTable buyers={buyers} />
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
      />
    </>
  );
}

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const exportParams = new URLSearchParams();
  if (params.search) exportParams.set("search", params.search);
  if (params.city && params.city !== "All cities") exportParams.set("city", params.city);
  if (params.propertyType && params.propertyType !== "All types")
    exportParams.set("propertyType", params.propertyType);
  if (params.status && params.status !== "All statuses") exportParams.set("status", params.status);
  if (params.timeline && params.timeline !== "All timelines")
    exportParams.set("timeline", params.timeline);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Buyer Leads</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your buyer leads through the sales pipeline
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/buyers/import">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/buyers/export?${exportParams.toString()}`}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Link>
            </Button>
            <Button asChild>
              <Link href="/buyers/new">
                <Plus className="h-4 w-4 mr-2" />
                New Lead
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <BuyersFilters />

          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                View and manage all your buyer leads with advanced filtering and
                search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<BuyersTableSkeleton />}>
                <BuyersContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
