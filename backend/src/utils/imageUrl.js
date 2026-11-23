const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
