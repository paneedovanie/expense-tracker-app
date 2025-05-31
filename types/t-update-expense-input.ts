import { UpdateExpenseValidation } from "@/validations";
import { z } from "zod";

export type TUpdateExpenseInput = z.infer<typeof UpdateExpenseValidation>;
