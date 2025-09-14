import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { requireAuth } from "@/lib/auth";
import { buyerSchema } from "@/lib/validations/buyer";
import { createBuyerLimiter } from "@/lib/rate-limit";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const city = searchParams.get("city");
    const propertyType = searchParams.get("propertyType");
    const status = searchParams.get("status");
    const timeline = searchParams.get("timeline");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = { ownerId: user.id };

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

    // Get buyers with pagination
    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.buyer.count({ where }),
    ]);

    return NextResponse.json({
      buyers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return NextResponse.json(
      { error: "Failed to fetch buyers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResult = createBuyerLimiter(request, user.id);
    if (rateLimitResult.isLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = buyerSchema.parse(body);

    // Create buyer
    const buyer = await prisma.buyer.create({
      data: {
        ...validatedData,
        ownerId: user.id,
      },
    });

    // Create history entry
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: user.id,
        diff: { action: "created", data: validatedData },
      },
    });

    const response = NextResponse.json(buyer, { status: 201 });

    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating buyer:", error);
    return NextResponse.json(
      { error: "Failed to create buyer" },
      { status: 500 }
    );
  }
}
