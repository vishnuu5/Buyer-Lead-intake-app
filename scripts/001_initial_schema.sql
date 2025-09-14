-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "City" AS ENUM ('CHANDIGARH', 'MOHALI', 'ZIRAKPUR', 'PANCHKULA', 'OTHER');
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'RETAIL');
CREATE TYPE "BHK" AS ENUM ('STUDIO', 'ONE', 'TWO', 'THREE', 'FOUR');
CREATE TYPE "Purpose" AS ENUM ('BUY', 'RENT');
CREATE TYPE "Timeline" AS ENUM ('ZERO_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'EXPLORING');
CREATE TYPE "Source" AS ENUM ('WEBSITE', 'REFERRAL', 'WALK_IN', 'CALL', 'OTHER');
CREATE TYPE "Status" AS ENUM ('NEW', 'QUALIFIED', 'CONTACTED', 'VISITED', 'NEGOTIATION', 'CONVERTED', 'DROPPED');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create buyers table
CREATE TABLE "buyers" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "bhk" "BHK",
    "purpose" "Purpose" NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "timeline" "Timeline" NOT NULL,
    "source" "Source" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "tags" TEXT[],
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- Create buyer_history table
CREATE TABLE "buyer_history" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" JSONB NOT NULL,

    CONSTRAINT "buyer_history_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Add foreign key constraints
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "buyers_ownerId_idx" ON "buyers"("ownerId");
CREATE INDEX "buyers_status_idx" ON "buyers"("status");
CREATE INDEX "buyers_city_idx" ON "buyers"("city");
CREATE INDEX "buyers_propertyType_idx" ON "buyers"("propertyType");
CREATE INDEX "buyers_timeline_idx" ON "buyers"("timeline");
CREATE INDEX "buyers_updatedAt_idx" ON "buyers"("updatedAt" DESC);
CREATE INDEX "buyer_history_buyerId_idx" ON "buyer_history"("buyerId");
CREATE INDEX "buyer_history_changedAt_idx" ON "buyer_history"("changedAt" DESC);
