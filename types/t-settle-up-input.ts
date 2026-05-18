import { SettleUpValidation } from "@/validations";
import { z } from "zod";

export type TSettleUpInput = z.infer<typeof SettleUpValidation>;
