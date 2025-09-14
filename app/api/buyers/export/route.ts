import { type NextRequest, NextResponse } from "next/server";
import { stringify } from "csv-stringify/sync";
import { prisma } from "@/lib/database";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Apply the same filters as the listing page
    const where: any = { ownerId: user.id };

    const city = searchParams.get("city");
    const propertyType = searchParams.get("propertyType");
    const status = searchParams.get("status");
    const timeline = searchParams.get("timeline");
    const search = searchParams.get("search");

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    // Fetch all matching buyers (no pagination for export)
    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
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
        source: true,
        status: true,
        notes: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (buyers.length === 0) {
      return NextResponse.json(
        { error: "No leads found to export" },
        { status: 404 }
      );
    }

    // Transform data for CSV export
    const csvData = buyers.map((buyer: (typeof buyers)[0]) => ({
      fullName: buyer.fullName,
      email: buyer.email || "",
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || "",
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || "",
      budgetMax: buyer.budgetMax || "",
      timeline: buyer.timeline,
      source: buyer.source,
      status: buyer.status,
      notes: buyer.notes || "",
      tags: buyer.tags.join(","),
      createdAt: buyer.createdAt.toISOString(),
      updatedAt: buyer.updatedAt.toISOString(),
    }));

    // Generate CSV
    const csv = stringify(csvData, {
      header: true,
      columns: [
        "fullName",
        "email",
        "phone",
        "city",
        "propertyType",
        "bhk",
        "purpose",
        "budgetMin",
        "budgetMax",
        "timeline",
        "source",
        "status",
        "notes",
        "tags",
        "createdAt",
        "updatedAt",
      ],
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `buyer-leads-${timestamp}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting buyers:", error);
    return NextResponse.json(
      { error: "Failed to export buyers" },
      { status: 500 }
    );
  }
}
