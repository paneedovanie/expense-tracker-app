import { isDirty, z } from "zod";

export const ExpenseShareValidation = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().nonnegative(),
  percentage: z.coerce.number().nonnegative().optional(),
  shareValue: z.coerce.number().nonnegative().optional(),
  isPayer: z.boolean().optional(),
  isDirty: z.boolean().default(false).optional(),
});
