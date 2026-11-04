/**
 * In-app route for a notification `link` (web paths), when the mobile app has
 * an equivalent screen. Unknown links stay on the inbox.
 */
export function notificationRoute(link: string | null): string | null {
  if (!link) return null;
  const match = /^\/reports\/(\d+)\/?$/.exec(link);
  return match ? `/reports/${match[1]}` : null;
}
