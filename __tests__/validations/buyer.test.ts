import { describe, it, expect } from "@jest/globals";
import { buyerSchema, csvBuyerSchema } from "@/lib/validations/buyer";

describe("Buyer Validation", () => {
  describe("buyerSchema", () => {
    it("should validate a complete buyer object", () => {
      const validBuyer = {
        fullName: "User",
        email: "user1@example.com",
        phone: "9876543210",
        city: "CHANDIGARH" as const,
        propertyType: "APARTMENT" as const,
        bhk: "TWO" as const,
        purpose: "BUY" as const,
        budgetMin: 5000000,
        budgetMax: 7000000,
        timeline: "ZERO_TO_THREE_MONTHS" as const,
        source: "WEBSITE" as const,
        status: "NEW" as const,
        notes: "Looking for 2BHK apartment",
        tags: ["urgent", "family"],
      };

      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it("should require BHK for apartment property type", () => {
      const buyerWithoutBHK = {
        fullName: "user",
        phone: "9876543210",
        city: "CHANDIGARH" as const,
        propertyType: "APARTMENT" as const,
        purpose: "BUY" as const,
        timeline: "ZERO_TO_THREE_MONTHS" as const,
        source: "WEBSITE" as const,
      };

      const result = buyerSchema.safeParse(buyerWithoutBHK);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["bhk"]);
      }
    });

    it("should validate budget constraints", () => {
      const buyerWithInvalidBudget = {
        fullName: "user",
        phone: "9876543210",
        city: "CHANDIGARH" as const,
        propertyType: "PLOT" as const,
        purpose: "BUY" as const,
        budgetMin: 7000000,
        budgetMax: 5000000, // Max less than min
        timeline: "ZERO_TO_THREE_MONTHS" as const,
        source: "WEBSITE" as const,
      };

      const result = buyerSchema.safeParse(buyerWithInvalidBudget);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["budgetMax"]);
      }
    });

    it("should validate phone number format", () => {
      const buyerWithInvalidPhone = {
        fullName: "user",
        phone: "123", 
        city: "CHANDIGARH" as const,
        propertyType: "PLOT" as const,
        purpose: "BUY" as const,
        timeline: "ZERO_TO_THREE_MONTHS" as const,
        source: "WEBSITE" as const,
      };

      const result = buyerSchema.safeParse(buyerWithInvalidPhone);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["phone"]);
      }
    });

    it("should validate full name length", () => {
      const buyerWithShortName = {
        fullName: "U", 
        phone: "9876543210",
        city: "CHANDIGARH" as const,
        propertyType: "PLOT" as const,
        purpose: "BUY" as const,
        timeline: "ZERO_TO_THREE_MONTHS" as const,
        source: "WEBSITE" as const,
      };

      const result = buyerSchema.safeParse(buyerWithShortName);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["fullName"]);
      }
    });
  });

  describe("csvBuyerSchema", () => {
    it("should transform comma-separated tags", () => {
      const csvBuyer = {
        fullName: "user",
        phone: "9876543210",
        city: "CHANDIGARH" as const,
        propertyType: "PLOT" as const,
        purpose: "BUY" as const,
        timeline: "ZERO_TO_THREE_MONTHS" as const,
        source: "WEBSITE" as const,
        tags: "urgent,family,premium",
      };

      const result = csvBuyerSchema.safeParse(csvBuyer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(["urgent", "family", "premium"]);
      }
    });

    it("should handle empty tags string", () => {
      const csvBuyer = {
        fullName: "user",
        phone: "9876543210",
        city: "CHANDIGARH" as const,
        propertyType: "PLOT" as const,
        purpose: "BUY" as const,
        timeline: "ZERO_TO_THREE_MONTHS" as const,
        source: "WEBSITE" as const,
        tags: "",
      };

      const result = csvBuyerSchema.safeParse(csvBuyer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });
  });
});
