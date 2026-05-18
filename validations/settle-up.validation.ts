import { z } from "zod";

export const SettleUpValidation = z.object({
  userId: z.string().uuid(),
});
