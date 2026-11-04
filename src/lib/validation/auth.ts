import { z } from 'zod';

export const twoFactorSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, 'Enter the 6-digit code or a recovery code')
    .max(32, 'Code must be 32 characters or less'),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;
