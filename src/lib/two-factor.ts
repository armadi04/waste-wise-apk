/** "JBSWY3DPEHPK3PXP" → "JBSW Y3DP EHPK 3PXP" for manual entry. */
export function groupSecret(secret: string): string {
  return secret.replace(/(.{4})(?=.)/g, '$1 ');
}
