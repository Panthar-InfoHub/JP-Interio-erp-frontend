/**
 * "Back to where I came from" (DEC-283): a details page link carries the page that opened
 * it as `?from=<path + search>`, and the details page's back link returns there.
 */

/** The address of the current page (path + search), for a `from` value. */
export function currentAddress(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

/** `href` with `from` added. */
export function withFrom(href: string, from: string): string {
  return `${href}${href.includes("?") ? "&" : "?"}from=${encodeURIComponent(from)}`;
}

/**
 * A `from` value that is safe to go back to: a panel path starting with one "/" (never
 * "//host" or "/\host", which would leave the panel). Anything else → null.
 */
export function safeFrom(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}
