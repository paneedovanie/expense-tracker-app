import { PasswordResetValidation } from "@/validations";
import { z } from "zod";

export type TPasswordResetInput = z.infer<typeof PasswordResetValidation>;
