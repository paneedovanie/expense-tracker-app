import { EDiscountType } from "./e-discount-type";
import { EExpenseCategory } from "./e-expense-category";
import { ERecurrenceFrenquency } from "./e-recurrence-frequency";
import { ESplitType } from "./e-split-type";
import { IExpenseShare } from "./i-expense-share";
import { IGroup } from "./i-group";
import { IPayment } from "./i-payment";

export interface IExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  groupId: string | null;
  category: EExpenseCategory;
  notes?: string | null;
  receiptUrl: string | null;
  splitType: ESplitType;
  discount: number;
  discountType: EDiscountType;
  isRecurring: boolean;
  recurrenceFrequency: ERecurrenceFrenquency | null;
  recurrenceInterval: number | null;
  recurrenceEndDate: Date | null;
  recurrenceStartDate: Date | null;
  originalRecurringExpenseId: string;
  createdAt: Date;
  updatedAt: Date;
  paidByShares: IExpenseShare[];
  paidForShares: IExpenseShare[];
  group: IGroup;
  payments: IPayment[];
}
