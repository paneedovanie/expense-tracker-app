import { EExpenseCategory, ERecurrenceFrenquency, ESplitType } from "@/types";
import { z } from "zod";
import { ExpenseShareValidation } from "./expense-share.validation";

export const CreateExpenseValidation = z.object({
  description: z.string().nonempty("Required"),
  amount: z.coerce.number().nonnegative().min(0.01, "Required"),
  date: z.date(),
  groupId: z.string().uuid(),
  category: z.nativeEnum(EExpenseCategory),
  notes: z.string().optional(),
  splitType: z.nativeEnum(ESplitType),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: z.nativeEnum(ERecurrenceFrenquency).optional(),
  recurrenceInterval: z.number().optional(),
  recurrenceEndDate: z.date().optional(),
  recurrenceStartDate: z.date().optional(),
  shares: ExpenseShareValidation.array()
    .min(2)
    .refine((shares) => shares.some((share) => share.isPayer), {
      message: "At least one payer is required",
    }),
});
