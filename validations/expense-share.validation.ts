import { z } from "zod";

export const ExpenseShareValidation = z.object({
  userId: z.string().uuid(),
  amount: z.number().nonnegative(),
  percentage: z.number().nonnegative().optional(),
  shareValue: z.number().nonnegative().optional(),
  isPayer: z.boolean().optional(),
});
