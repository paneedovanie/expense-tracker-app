import { EExpenseCategory, ERecurrenceFrenquency, ESplitType } from "@/types";
import { z } from "zod";
import { ExpenseShareValidation } from "./expense-share.validation";

export const UpdateExpenseValidation = z.object({
  description: z.string().nonempty("Required"),
  amount: z.coerce.number(),
  date: z.date(),
  category: z.nativeEnum(EExpenseCategory),
  notes: z.string(),
  splitType: z.nativeEnum(ESplitType),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: z.nativeEnum(ERecurrenceFrenquency).optional(),
  recurrenceInterval: z.number().optional(),
  recurrenceEndDate: z.date().optional(),
  recurrenceStartDate: z.date().optional(),
  shares: ExpenseShareValidation.array()
    .min(2)
    .min(2)
    .refine((shares) => shares.some((share) => share.isPayer), {
      message: "At least one payer is required",
    }),
});
