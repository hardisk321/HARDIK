// Resolve a possibly-relative image URL to a fully-qualified URL.
// Backend returns "/api/images/<id>.<ext>" for self-hosted images;
// the catalog/detail pages are SPA routes and need the full backend host.
const BACKEND = process.env.REACT_APP_BACKEND_URL || "";

export function resolveImageUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${BACKEND}${url}`;
  return url;
}
