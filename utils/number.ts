import { EDiscountType, IExpense, TExpenseInput } from "@/types";
import { round } from "lodash";

export const formatCurrency = (value: number, currency?: string) => {
  return new Intl.NumberFormat("en-US", {
    ...(currency
      ? {
          style: "currency",
          currency,
        }
      : {}),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const normalizeNumberInput = (val: string) => {
  if (val.split(".").length - 1 > 1) {
    const parts = val.split("."); // Split the string by the decimal point

    // Take the first part (integer) and the first part after the first decimal
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : "";

    // Reconstruct the string with only one decimal point if there was one.
    // If original was "123.", decimalPart would be empty, so it becomes "123".
    const cleanedString = decimalPart
      ? `${integerPart}.${decimalPart}`
      : integerPart;

    return cleanedString;
  }

  if (val.includes(".")) {
    return val;
  }
  // Allow only numbers and one decimal point
  return Number(val).toString();
};

export const getExpenseAmount = (
  expense?: IExpense | TExpenseInput
): number => {
  if (!expense) return 0;

  if (expense.discount === 0) {
    return expense.amount;
  }

  const discount = expense.discount ?? 0;

  if (expense.discountType === EDiscountType.Exact) {
    return expense.amount - discount;
  }

  return round(expense.amount - expense.amount * (discount / 100), 2);
};
