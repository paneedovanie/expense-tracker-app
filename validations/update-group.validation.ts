import { z } from "zod";
import { AvatarFileValidation } from "./avatar-file.validation";

export const UpdateGroupValidation = z
  .object({
    name: z.string().nonempty("Required"),
    description: z.coerce.string().optional(),
    avatarFile: AvatarFileValidation.optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.avatarFile &&
      typeof data.avatarFile.size === "number" &&
      data.avatarFile.size > 1024 * 1024
    ) {
      ctx.addIssue({
        path: ["avatarFile"],
        code: z.ZodIssueCode.custom,
        message: "File size must be 1MB or less",
      });
    }
  });
