import { type NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/database";
import { requireAuth } from "@/lib/auth";
import { csvBuyerSchema } from "@/lib/validations/buyer";
import { importLimiter } from "@/lib/rate-limit";
import { z } from "zod";

interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResult = importLimiter(request, user.id);
    if (rateLimitResult.isLimited) {
      return NextResponse.json(
        { error: "Import limit exceeded. Please try again later." },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }

    const text = await file.text();
    let records: any[];

    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid CSV format" },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    if (records.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 rows allowed per import" },
        { status: 400 }
      );
    }

    // Validate each row
    const validRecords: any[] = [];
    const errors: ImportError[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // +2 because CSV has header row and arrays are 0-indexed

      try {
        // Transform the record to match our schema
        const transformedRecord = {
          fullName: record.fullName?.trim(),
          email: record.email?.trim() || undefined,
          phone: record.phone?.trim(),
          city: record.city?.trim()?.toUpperCase(),
          propertyType: record.propertyType?.trim()?.toUpperCase(),
          bhk: record.bhk?.trim()?.toUpperCase(),
          purpose: record.purpose?.trim()?.toUpperCase(),
          budgetMin: record.budgetMin
            ? Number.parseInt(record.budgetMin)
            : undefined,
          budgetMax: record.budgetMax
            ? Number.parseInt(record.budgetMax)
            : undefined,
          timeline: record.timeline
            ?.trim()
            ?.toUpperCase()
            ?.replace(/\s+/g, "_"),
          source: record.source?.trim()?.toUpperCase()?.replace(/\s+/g, "_"),
          status: record.status?.trim()?.toUpperCase() || "NEW",
          notes: record.notes?.trim() || undefined,
          tags: record.tags?.trim() || "",
        };

        // Validate the transformed record
        const validatedRecord = csvBuyerSchema.parse(transformedRecord);
        validRecords.push({ ...validatedRecord, ownerId: user.id });
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((err) => {
            errors.push({
              row: rowNumber,
              field: err.path.join("."),
              message: err.message,
              data: record,
            });
          });
        } else {
          errors.push({
            row: rowNumber,
            message: "Invalid data format",
            data: record,
          });
        }
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: `${errors.length} validation errors found`,
        errors,
        validCount: validRecords.length,
        totalCount: records.length,
      });
    }

    // Import valid records in a transaction
    const importedBuyers = await prisma.$transaction(async (tx: any) => {
      const buyers = [];
      for (const record of validRecords) {
        const buyer = await tx.buyer.create({
          data: record,
        });

        // Create history entry
        await tx.buyerHistory.create({
          data: {
            buyerId: buyer.id,
            changedBy: user.id,
            diff: { action: "imported", data: record },
          },
        });

        buyers.push(buyer);
      }
      return buyers;
    });

    const response = NextResponse.json({
      success: true,
      message: `Successfully imported ${importedBuyers.length} leads`,
      importedCount: importedBuyers.length,
      totalCount: records.length,
    });

    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error("Error importing buyers:", error);
    return NextResponse.json(
      { error: "Failed to import buyers" },
      { status: 500 }
    );
  }
}
