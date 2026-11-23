const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  !["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api");

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;
  return `${BACKEND_ORIGIN}${normalizedPath}`;
};
