import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");

    try {
      await prisma.user.count();
    } catch (error: any) {
      if (error.code === "P2021" || error.message.includes("does not exist")) {
        console.error("❌ Database tables don't exist!");
        console.log("📋 Please run the following commands first:");
        console.log("   1. npm run db:migrate");
        console.log("   2. npm run db:seed");
        process.exit(1);
      }
      throw error;
    }

    // Create a demo user
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        id: "demo-user-id",
        email: "demo@example.com",
        name: "Demo User",
      },
    });

    console.log("👤 Created demo user:", demoUser.email);

    // Create sample buyers
    const sampleBuyers = [
      {
        fullName: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9876543210",
        city: "CHANDIGARH",
        propertyType: "APARTMENT",
        bhk: "TWO",
        purpose: "BUY",
        budgetMin: 5000000,
        budgetMax: 7000000,
        timeline: "ZERO_TO_THREE_MONTHS",
        source: "WEBSITE",
        status: "NEW",
        notes: "Looking for 2BHK in Sector 22",
        tags: ["urgent", "family"],
        ownerId: demoUser.id,
      },
      {
        fullName: "Priya Sharma",
        email: "priya@example.com",
        phone: "9876543211",
        city: "MOHALI",
        propertyType: "VILLA",
        bhk: "THREE",
        purpose: "BUY",
        budgetMin: 8000000,
        budgetMax: 12000000,
        timeline: "THREE_TO_SIX_MONTHS",
        source: "REFERRAL",
        status: "QUALIFIED",
        notes: "Prefers independent house with garden",
        tags: ["premium", "spacious"],
        ownerId: demoUser.id,
      },
      {
        fullName: "Amit Singh",
        phone: "9876543212",
        city: "ZIRAKPUR",
        propertyType: "PLOT",
        purpose: "BUY",
        budgetMin: 3000000,
        budgetMax: 5000000,
        timeline: "MORE_THAN_SIX_MONTHS",
        source: "WALK_IN",
        status: "CONTACTED",
        notes: "Investment purpose, flexible on location",
        tags: ["investment"],
        ownerId: demoUser.id,
      },
      {
        fullName: "Neha Gupta",
        email: "neha@example.com",
        phone: "9876543213",
        city: "PANCHKULA",
        propertyType: "OFFICE",
        purpose: "RENT",
        budgetMin: 50000,
        budgetMax: 80000,
        timeline: "ZERO_TO_THREE_MONTHS",
        source: "CALL",
        status: "VISITED",
        notes: "Small office space for startup",
        tags: ["commercial", "startup"],
        ownerId: demoUser.id,
      },
      {
        fullName: "Vikram Mehta",
        email: "vikram@example.com",
        phone: "9876543214",
        city: "CHANDIGARH",
        propertyType: "APARTMENT",
        bhk: "ONE",
        purpose: "RENT",
        budgetMin: 15000,
        budgetMax: 25000,
        timeline: "EXPLORING",
        source: "OTHER",
        status: "CONVERTED",
        notes: "Young professional, close to IT park",
        tags: ["professional", "furnished"],
        ownerId: demoUser.id,
      },
    ];

    for (const buyer of sampleBuyers) {
      const createdBuyer = await prisma.buyer.create({
        data: buyer as any,
      });

      // Create history entry
      await prisma.buyerHistory.create({
        data: {
          buyerId: createdBuyer.id,
          changedBy: demoUser.id,
          diff: { action: "seeded", data: buyer },
        },
      });

      console.log("🏠 Created buyer:", createdBuyer.fullName);
    }

    console.log("✅ Database seed completed!");
  } catch (error: any) {
    console.error("❌ Seed failed:", error.message);

    if (error.code === "P1001") {
      console.log(
        "🔧 Database connection failed. Check your DATABASE_URL in .env file"
      );
    } else if (
      error.code === "P2021" ||
      error.message.includes("does not exist")
    ) {
      console.log("🔧 Tables don't exist. Run: npm run db:migrate");
    } else if (error.message.includes("buyer_leads")) {
      console.log(
        "🔧 Wrong database name. Make sure DATABASE_URL points to 'postgres' not 'buyer_leads'"
      );
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
