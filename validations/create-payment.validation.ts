import { z } from "zod";
import { ImageFileValidation } from "./avatar-file.validation";

export const CreatePaymentValidation = z.object({
  payerUserId: z.string().uuid(),
  receiverUserId: z.string().uuid(),
  amount: z.coerce.number().nonnegative().min(0.01, "Required"),
  currency: z.string().default("PHP").optional(),
  date: z
    .date()
    .default(() => new Date())
    .optional(),
  expenseId: z.string().uuid(),
  groupId: z.string().uuid().nullable().optional(),
  receiptFile: ImageFileValidation.optional(),
});
