const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const normalizedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

const isAbsoluteUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:") ||
  value.startsWith("mailto:") ||
  value.startsWith("#");

export function withBasePath(path: string) {
  if (!path || isAbsoluteUrl(path) || !path.startsWith("/")) return path;
  if (!normalizedBasePath) return path;
  if (path.startsWith(`${normalizedBasePath}/`) || path === normalizedBasePath) {
    return path;
  }
  return `${normalizedBasePath}${path}`;
}
