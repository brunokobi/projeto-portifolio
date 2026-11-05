export function isActivePath(pathname: string, url?: string): boolean {
  if (!url || url.startsWith("http")) return false;
  return url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`);
}
