import { z } from "zod";

export const PasswordResetValidation = z.object({
  email: z.string().email().nonempty("Required"),
});
