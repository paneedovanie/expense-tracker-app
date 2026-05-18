import { UpdatePaymentValidation } from "@/validations";
import { z } from "zod";

export type TUpdatePaymentInput = z.infer<typeof UpdatePaymentValidation>;
