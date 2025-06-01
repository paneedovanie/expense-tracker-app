import { z } from "zod";

export const LoginValidation = z.object({
  email: z.string().email().nonempty("Required"),
});
