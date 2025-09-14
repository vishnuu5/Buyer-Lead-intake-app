import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { requireAuth } from "@/lib/auth";
import { buyerSchema } from "@/lib/validations/buyer";
import { updateBuyerLimiter } from "@/lib/rate-limit";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const buyer = await prisma.buyer.findFirst({
      where: { id, ownerId: user.id },
      include: {
        history: {
          take: 5,
          orderBy: { changedAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error("Error fetching buyer:", error);
    return NextResponse.json(
      { error: "Failed to fetch buyer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const rateLimitResult = updateBuyerLimiter(request, user.id);
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

    // Check if buyer exists and belongs to user
    const existingBuyer = await prisma.buyer.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Check for concurrent updates
    const providedUpdatedAt = body.updatedAt;
    if (
      providedUpdatedAt &&
      new Date(providedUpdatedAt) < existingBuyer.updatedAt
    ) {
      return NextResponse.json(
        {
          error:
            "Record has been updated by another user. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    // Validate input
    const validatedData = buyerSchema.parse(body);

    // Calculate diff for history
    const diff: any = {};
    Object.keys(validatedData).forEach((key) => {
      const newValue = (validatedData as any)[key];
      const oldValue = (existingBuyer as any)[key];
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        diff[key] = { from: oldValue, to: newValue };
      }
    });

    // Update buyer
    const buyer = await prisma.buyer.update({
      where: { id },
      data: validatedData,
    });

    // Create history entry if there are changes
    if (Object.keys(diff).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId: buyer.id,
          changedBy: user.id,
          diff: { action: "updated", changes: diff },
        },
      });
    }

    const response = NextResponse.json(buyer);

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

    console.error("Error updating buyer:", error);
    return NextResponse.json(
      { error: "Failed to update buyer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if buyer exists and belongs to user
    const existingBuyer = await prisma.buyer.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Delete buyer (history will be cascade deleted)
    await prisma.buyer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Buyer deleted successfully" });
  } catch (error) {
    console.error("Error deleting buyer:", error);
    return NextResponse.json(
      { error: "Failed to delete buyer" },
      { status: 500 }
    );
  }
}
