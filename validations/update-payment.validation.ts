import { z } from "zod";
import { ImageFileValidation } from "./avatar-file.validation";

export const UpdatePaymentValidation = z.object({
  amount: z.coerce.number().nonnegative().min(0.01, "Required"),
  currency: z.string().default("PHP"),
  date: z.date().default(() => new Date()),
  receiptFile: ImageFileValidation.optional(),
});
