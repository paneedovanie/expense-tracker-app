import { z } from "zod";

export const AvatarFileValidation = z
  .object({
    uri: z.string(),
    type: z.enum(["image/jpeg", "image/png"], {
      errorMap: () => ({ message: "Only JPEG and PNG files are allowed" }),
    }),
    name: z.string(),
    size: z.number(),
  })
  .partial();
