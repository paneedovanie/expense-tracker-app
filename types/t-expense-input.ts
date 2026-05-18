import { ExpenseValidation } from "@/validations";
import { z } from "zod";

export type TExpenseInput = z.infer<typeof ExpenseValidation>;
