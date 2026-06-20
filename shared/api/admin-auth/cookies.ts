export function readCookie(
  name: string,
  cookieSource = typeof document === "undefined" ? "" : document.cookie,
): string | undefined {
  const prefix = `${name}=`;
  const cookie = cookieSource
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) return undefined;

  const value = cookie.slice(prefix.length);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
