import { z } from 'zod';

export const reportSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .max(2000, 'Description must be 2000 characters or less'),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
