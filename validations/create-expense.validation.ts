import { EExpenseCategory, ERecurrenceFrenquency, ESplitType } from "@/types";
import { z } from "zod";

export const CreateExpenseValidation = z.object({
  description: z.string().nonempty("Required"),
  amount: z.number().nonnegative().min(0.01, "Required"),
  paidByUserId: z.string().uuid(),
  date: z.date(),
  groupId: z.string().uuid(),
  category: z.nativeEnum(EExpenseCategory),
  notes: z.string(),
  splitType: z.nativeEnum(ESplitType),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: z.nativeEnum(ERecurrenceFrenquency).optional(),
  recurrenceInterval: z.number().optional(),
  recurrenceEndDate: z.date().optional(),
  recurrenceStartDate: z.date().optional(),
});
