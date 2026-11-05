import { z } from 'zod';

export const profileSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or less'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone must be 20 characters or less')
    .refine(
      (value) => value === '' || /^\+?[0-9][0-9\s-]{5,}$/.test(value),
      'Use digits, spaces or dashes, optionally starting with +',
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
