/**
 * Determines whether a given URL is an internal link based on the hostname.
 *
 * @param {string} href - The URL to check. Can be a relative or absolute URL.
 * @param {string[]} internalHosts - Array of hostnames considered as internal.
 * @returns {boolean} Returns true if the link is internal (relative URL or matches internal hosts), false otherwise.
 *
 * @example
 * // Returns true for relative URLs
 * isInternalLink('/about', ['example.com'])
 *
 * @example
 * // Returns true for matching internal hosts
 * isInternalLink('https://example.com/page', ['example.com'])
 *
 * @example
 * // Returns false for external URLs
 * isInternalLink('https://external.com/page', ['example.com'])
 */
export default function isInternalLink(href, internalHosts) {
  if (!href.includes(':')) {
    return true;
  }

  try {
    return internalHosts.includes(new URL(href).host);
  } catch {}

  return false;
}
