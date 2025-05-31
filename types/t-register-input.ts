import { RegisterValidation } from "@/validations";
import { z } from "zod";

export type TRegisterInput = z.infer<typeof RegisterValidation>;
