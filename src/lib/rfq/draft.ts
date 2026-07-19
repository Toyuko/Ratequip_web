import { z } from "zod";

export const rfqDraftSchema = z.object({
  title: z.string().describe("Short RFQ title"),
  description: z
    .string()
    .describe("Buyer-facing summary of the need and context"),
  currency: z
    .enum(["USD", "AUD", "EUR", "GBP", "SGD", "THB", "VND", "CNY", "JPY"])
    .default("USD"),
  taxTreatment: z.enum(["inclusive", "exclusive"]).default("inclusive"),
  quoteValidityDays: z.number().int().positive().default(30),
  deliveryCountry: z.string().default(""),
  deliveryCity: z.string().optional().default(""),
  deliveryAddress: z.string().optional().default(""),
  dueDate: z
    .string()
    .optional()
    .describe("ISO date YYYY-MM-DD if a closing date is mentioned"),
  referenceModel: z
    .string()
    .optional()
    .describe("Reference / existing equipment model to match"),
  complianceStandards: z.array(z.string()).default([]),
  materialOfConstruction: z.string().optional().default(""),
  utilitiesNotes: z.string().optional().default(""),
  warrantyMonthsRequired: z.number().int().positive().optional(),
  deliveryWeeksRequired: z.number().int().positive().optional(),
  scopeOfSupply: z.array(z.string()).default([]),
  technicalRequirements: z
    .array(
      z.object({
        text: z.string(),
        priority: z.enum(["must", "prefer", "optional"]).default("must"),
      }),
    )
    .default([]),
  items: z
    .array(
      z.object({
        productName: z.string(),
        productCode: z.string().optional().default(""),
        quantity: z.number().positive().default(1),
        unit: z.string().optional().default("unit"),
        oemOnly: z.boolean().default(false),
        notes: z.string().optional().default(""),
      }),
    )
    .default([]),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
});

export type RfqDraft = z.infer<typeof rfqDraftSchema>;
