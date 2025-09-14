import { z } from "zod";

export const cityEnum = z.enum([
  "CHANDIGARH",
  "MOHALI",
  "ZIRAKPUR",
  "PANCHKULA",
  "OTHER",
]);
export const propertyTypeEnum = z.enum([
  "APARTMENT",
  "VILLA",
  "PLOT",
  "OFFICE",
  "RETAIL",
]);
export const bhkEnum = z.enum(["STUDIO", "ONE", "TWO", "THREE", "FOUR"]);
export const purposeEnum = z.enum(["BUY", "RENT"]);
export const timelineEnum = z.enum([
  "ZERO_TO_THREE_MONTHS",
  "THREE_TO_SIX_MONTHS",
  "MORE_THAN_SIX_MONTHS",
  "EXPLORING",
]);
export const sourceEnum = z.enum([
  "WEBSITE",
  "REFERRAL",
  "WALK_IN",
  "CALL",
  "OTHER",
]);
export const statusEnum = z.enum([
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "VISITED",
  "NEGOTIATION",
  "CONVERTED",
  "DROPPED",
]);

export const buyerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be less than 80 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
    city: cityEnum,
    propertyType: propertyTypeEnum,
    bhk: bhkEnum.optional(),
    purpose: purposeEnum,
    budgetMin: z.number().int().positive().optional(),
    budgetMax: z.number().int().positive().optional(),
    timeline: timelineEnum,
    source: sourceEnum,
    status: statusEnum.optional().default("NEW"),
    notes: z
      .string()
      .max(1000, "Notes must be less than 1000 characters")
      .optional(),
    tags: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      // BHK required for Apartment/Villa
      if (["APARTMENT", "VILLA"].includes(data.propertyType) && !data.bhk) {
        return false;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment and Villa property types",
      path: ["bhk"],
    }
  )
  .refine(
    (data) => {
      // Budget validation
      if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budgetMax"],
    }
  );

export const csvBuyerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be less than 80 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
    city: cityEnum,
    propertyType: propertyTypeEnum,
    bhk: bhkEnum.optional(),
    purpose: purposeEnum,
    budgetMin: z.number().int().positive().optional(),
    budgetMax: z.number().int().positive().optional(),
    timeline: timelineEnum,
    source: sourceEnum,
    status: statusEnum.optional().default("NEW"),
    notes: z
      .string()
      .max(1000, "Notes must be less than 1000 characters")
      .optional(),
    tags: z
      .string()
      .transform((val) => (val ? val.split(",").map((tag) => tag.trim()) : [])),
  })
  .refine(
    (data) => {
      // BHK required for Apartment/Villa
      if (["APARTMENT", "VILLA"].includes(data.propertyType) && !data.bhk) {
        return false;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment and Villa property types",
      path: ["bhk"],
    }
  )
  .refine(
    (data) => {
      // Budget validation
      if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budgetMax"],
    }
  );

export type BuyerFormData = z.infer<typeof buyerSchema>;
export type CSVBuyerData = z.infer<typeof csvBuyerSchema>;
