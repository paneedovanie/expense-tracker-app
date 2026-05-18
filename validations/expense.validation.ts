import { EDiscountType, EExpenseCategory, ESplitType } from "@/types";
import { z } from "zod";
import { ExpenseShareValidation } from "./expense-share.validation";
import { getExpenseAmount } from "@/utils";

export const ExpenseValidation = z
  .object({
    description: z.string().nonempty("Required"),
    amount: z.coerce.number().nonnegative().min(0.01, "Required"),
    date: z.date(),
    groupId: z.string().uuid().optional(),
    category: z.nativeEnum(EExpenseCategory),
    notes: z.string().optional(),
    splitType: z.nativeEnum(ESplitType),
    paidByShares: ExpenseShareValidation.array().min(1),
    paidForShares: ExpenseShareValidation.array().min(1),
    discount: z.coerce.number().nonnegative().default(0).optional(),
    discountType: z
      .nativeEnum(EDiscountType)
      .default(EDiscountType.Percentage)
      .optional(),
  })
  .refine(
    (data) => {
      const amount = getExpenseAmount(data);
      const totalPaidByAmount = data.paidByShares.reduce(
        (sum, share) => sum + share.amount,
        0
      );
      return Math.abs(totalPaidByAmount - amount) < 0.01;
    },
    {
      message:
        "The sum of 'Paid By' shares must exactly match the total amount.",
      path: ["paidByShares"],
    }
  )
  .refine(
    (data) => {
      const amount = getExpenseAmount(data);
      const totalPaidForAmount = data.paidForShares.reduce(
        (sum, share) => sum + share.amount,
        0
      );
      return Math.abs(totalPaidForAmount - amount) < 0.01;
    },
    {
      message:
        "The sum of 'Paid For' shares must exactly match the total amount.",
      path: ["paidForShares"],
    }
  )
  .refine(
    (data) => {
      const discount = data.discount ?? 0;

      if (data.discountType === EDiscountType.Exact) {
        return data.amount - discount > 0;
      }

      return discount < 100;
    },
    {
      message:
        "Discount must be less than 100% for percentage type, or less than the total amount for exact type.",
      path: ["discount"],
    }
  );
