const clean = (value: unknown) =>
  typeof value === 'string'
    ? value
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/[();]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

/**
 * Descriptive User-Agent for API requests so the session list can name the
 * device: `WasteWise-Mobile/1.0.0 (Android 14; Xiaomi 23078RKD5C)`.
 * Pure so it can be unit-tested; `client.ts` passes `Platform.constants`.
 */
export function buildUserAgent(
  constants: Record<string, unknown>,
  appVersion: string | undefined,
  os: string,
): string {
  const version = clean(appVersion) || '0.0.0';
  const release = clean(constants.Release ?? constants.osVersion);
  const brand = clean(constants.Brand ?? constants.Manufacturer);
  const model = clean(constants.Model);
  const system =
    os === 'android' ? `Android${release ? ` ${release}` : ''}` : clean(os);
  const device = [
    brand && !model.toLowerCase().startsWith(brand.toLowerCase())
      ? capitalise(brand)
      : '',
    model,
  ]
    .filter(Boolean)
    .join(' ');
  const details = [system, device].filter(Boolean).join('; ');
  return `WasteWise-Mobile/${version}${details ? ` (${details})` : ''}`;
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
