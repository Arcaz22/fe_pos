import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
