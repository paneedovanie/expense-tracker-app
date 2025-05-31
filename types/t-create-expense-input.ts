import { CreateExpenseValidation } from "@/validations";
import { z } from "zod";

export type TCreateExpenseInput = z.infer<typeof CreateExpenseValidation>;
