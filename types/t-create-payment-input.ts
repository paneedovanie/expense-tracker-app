import { CreatePaymentValidation } from "@/validations";
import { z } from "zod";

export type TCreatePaymentInput = z.infer<typeof CreatePaymentValidation>;
