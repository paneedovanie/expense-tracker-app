import { ExpenseShareValidation } from "@/validations";
import { z } from "zod";

export type TExpenseShareInput = z.infer<typeof ExpenseShareValidation>;
