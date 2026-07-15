import { z } from "zod";

export const addUserSchema = z.object({
  email: z.string().min(3, "Email wajib diisi").email("Format email tidak valid").max(320),
  password: z.string().min(8, "Password minimal 8 karakter").max(128),
  role: z.enum(["admin", "cashier"]),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;
