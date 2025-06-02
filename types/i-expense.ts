import { EExpenseCategory } from "./e-expense-category";
import { ERecurrenceFrenquency } from "./e-recurrence-frequency";
import { ESplitType } from "./e-split-type";
import { IUser } from "./i-user";

export interface IExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  groupId: string | null;
  category: EExpenseCategory;
  notes: string | null;
  receiptUrl: string | null;
  splitType: ESplitType;
  isRecurring: boolean;
  recurrenceFrequency: ERecurrenceFrenquency | null;
  recurrenceInterval: number | null;
  recurrenceEndDate: Date | null;
  recurrenceStartDate: Date | null;
  originalRecurringExpenseId: string;
}
