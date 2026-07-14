import { z } from "zod";

export const createOrderSchema = z
  .object({
    customer_name: z.string().max(255).optional().or(z.literal("")),
    order_type: z.enum(["dine_in", "takeaway"]),
    table_number: z.string().max(50).optional().or(z.literal("")),
    payment_method: z.enum(["cash", "gateway"]),
    notes: z.string().max(1000).optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.order_type === "dine_in" && !values.table_number) {
      ctx.addIssue({
        code: "custom",
        path: ["table_number"],
        message: "Nomor meja wajib diisi untuk order makan di tempat.",
      });
    }
  });

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

// UpdateOrderPayload backend tidak mengizinkan ubah payment_method, jadi field ini
// sengaja tidak ada di schema edit (beda dengan createOrderSchema di atas).
export const editOrderSchema = z
  .object({
    customer_name: z.string().max(255).optional().or(z.literal("")),
    order_type: z.enum(["dine_in", "takeaway"]),
    table_number: z.string().max(50).optional().or(z.literal("")),
    notes: z.string().max(1000).optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.order_type === "dine_in" && !values.table_number) {
      ctx.addIssue({
        code: "custom",
        path: ["table_number"],
        message: "Nomor meja wajib diisi untuk order makan di tempat.",
      });
    }
  });

export type EditOrderFormValues = z.infer<typeof editOrderSchema>;
