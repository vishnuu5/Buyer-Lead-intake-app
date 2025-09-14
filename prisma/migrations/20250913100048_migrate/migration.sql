-- CreateEnum
CREATE TYPE "public"."City" AS ENUM ('CHANDIGARH', 'MOHALI', 'ZIRAKPUR', 'PANCHKULA', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'RETAIL');

-- CreateEnum
CREATE TYPE "public"."BHK" AS ENUM ('STUDIO', 'ONE', 'TWO', 'THREE', 'FOUR');

-- CreateEnum
CREATE TYPE "public"."Purpose" AS ENUM ('BUY', 'RENT');

-- CreateEnum
CREATE TYPE "public"."Timeline" AS ENUM ('ZERO_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'EXPLORING');

-- CreateEnum
CREATE TYPE "public"."Source" AS ENUM ('WEBSITE', 'REFERRAL', 'WALK_IN', 'CALL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('NEW', 'QUALIFIED', 'CONTACTED', 'VISITED', 'NEGOTIATION', 'CONVERTED', 'DROPPED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."buyers" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "city" "public"."City" NOT NULL,
    "propertyType" "public"."PropertyType" NOT NULL,
    "bhk" "public"."BHK",
    "purpose" "public"."Purpose" NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "timeline" "public"."Timeline" NOT NULL,
    "source" "public"."Source" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "tags" TEXT[],
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."buyer_history" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" JSONB NOT NULL,

    CONSTRAINT "buyer_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."buyers" ADD CONSTRAINT "buyers_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."buyer_history" ADD CONSTRAINT "buyer_history_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."buyer_history" ADD CONSTRAINT "buyer_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
