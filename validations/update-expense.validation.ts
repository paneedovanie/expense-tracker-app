import { EExpenseCategory, ERecurrenceFrenquency, ESplitType } from "@/types";
import { z } from "zod";

export const UpdateExpenseValidation = z.object({
  description: z.string().nonempty("Required"),
  amount: z.number(),
  paidByUserId: z.string().uuid(),
  date: z.date(),
  category: z.nativeEnum(EExpenseCategory),
  notes: z.string(),
  splitType: z.nativeEnum(ESplitType),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: z.nativeEnum(ERecurrenceFrenquency).optional(),
  recurrenceInterval: z.number().optional(),
  recurrenceEndDate: z.date().optional(),
  recurrenceStartDate: z.date().optional(),
});
