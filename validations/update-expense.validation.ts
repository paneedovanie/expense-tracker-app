import { EExpenseCategory, ERecurrenceFrenquency, ESplitType } from "@/types";
import { z } from "zod";
import { ExpenseShareValidation } from "./expense-share.validation";

export const UpdateExpenseValidation = z
  .object({
    description: z.string().nonempty("Required"),
    amount: z.coerce.number(),
    date: z.date(),
    category: z.nativeEnum(EExpenseCategory),
    notes: z.string().optional().nullable(),
    splitType: z.nativeEnum(ESplitType),
    paidByShares: ExpenseShareValidation.array().min(1),
    paidForShares: ExpenseShareValidation.array().min(1),
  })
  .refine(
    (data) => {
      const totalPaidByAmount = data.paidByShares.reduce(
        (sum, share) => sum + share.amount,
        0
      );
      return Math.abs(totalPaidByAmount - data.amount) < 0.01; // Using small epsilon for floating point comparison
    },
    {
      message: "Sum of paid by shares must equal the total amount",
      path: ["paidByShares"],
    }
  )
  .refine(
    (data) => {
      const totalPaidForAmount = data.paidForShares.reduce(
        (sum, share) => sum + share.amount,
        0
      );
      return Math.abs(totalPaidForAmount - data.amount) < 0.01; // Using small epsilon for floating point comparison
    },
    {
      message: "Sum of paid for shares must equal the total amount",
      path: ["paidForShares"],
    }
  );
