export interface DeviceInfo {
  label: string;
  kind: 'mobile-app' | 'phone' | 'desktop' | 'unknown';
  /** OS and version when the app reports it, e.g. "Android 14". */
  system?: string;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg(A|iOS)?\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string, DeviceInfo['kind']][] = [
  [/Android/, 'Android', 'phone'],
  [/iPhone|iPad|iPod/, 'iOS', 'phone'],
  [/Windows/, 'Windows', 'desktop'],
  [/Mac OS X|Macintosh/, 'macOS', 'desktop'],
  [/CrOS/, 'ChromeOS', 'desktop'],
  [/Linux/, 'Linux', 'desktop'],
];

/** Human label for a session's user agent: "Chrome on Windows", "Android app". */
const MOBILE_APP = /^WasteWise-Mobile(?:\/[\w.-]+)?(?:\s*\(([^)]*)\))?/;

export function describeUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent) return { label: 'Unknown device', kind: 'unknown' };
  const app = MOBILE_APP.exec(userAgent);
  if (app) {
    const parts = (app[1] ?? '').split(';').map((part) => part.trim());
    const device = parts.find((part) => part && !/^Android\b/.test(part));
    const system = parts.find((part) => /^Android\b/.test(part));
    return {
      label: device ? `WasteWise app · ${device}` : 'WasteWise Android app',
      kind: 'mobile-app',
      ...(system ? { system } : {}),
    };
  }
  // Older builds sent the HTTP library's default agent.
  if (/^(okhttp|Dalvik)\//.test(userAgent) || /Expo/i.test(userAgent)) {
    return { label: 'WasteWise Android app', kind: 'mobile-app' };
  }
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent));
  if (browser && system) {
    return { label: `${browser} on ${system[1]}`, kind: system[2] };
  }
  if (system) return { label: system[1], kind: system[2] };
  if (browser) return { label: browser, kind: 'desktop' };
  return { label: 'Unknown device', kind: 'unknown' };
}

/** "Mobile" for native app sessions, "Browser" for web dashboard sessions. */
export function audienceLabel(audience: string): string {
  return audience === 'mobile' ? 'Mobile' : 'Browser';
}
