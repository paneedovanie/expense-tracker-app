import { EPaymentMethod } from "./e-payment-method";
import { IExpense } from "./i-expense";
import { IUser } from "./i-user";

export interface IPayment {
  id: string;
  payerUserId: string;
  receiverUserId: string;
  amount: number;
  currency: string;
  date: Date;
  groupId: string | null;
  paymentMethod: EPaymentMethod;
  receiptUrl: string | null;
  expenseId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  payer: IUser;
  receiver: IUser;
  expense: IExpense;
}
