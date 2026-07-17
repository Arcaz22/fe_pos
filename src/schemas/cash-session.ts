import { z } from "zod";

export const openCashSessionSchema = z.object({
  opening_balance: z.number().min(0, "Modal awal tidak boleh negatif"),
});
export type OpenCashSessionFormValues = z.infer<typeof openCashSessionSchema>;

export const closeCashSessionSchema = z.object({
  closing_balance: z.number().min(0, "Uang fisik tidak boleh negatif"),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
export type CloseCashSessionFormValues = z.infer<typeof closeCashSessionSchema>;
 
