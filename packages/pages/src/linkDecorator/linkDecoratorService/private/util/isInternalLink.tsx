export default function isInternalLink(href: string, internalHosts: string[]): boolean {
  if (!href.includes(':')) {
    return true;
  }

  try {
    const url = new URL(href);

    if (internalHosts.includes(url.host)) {
      return true;
    }
  } catch (error) {}

  return false;
}
