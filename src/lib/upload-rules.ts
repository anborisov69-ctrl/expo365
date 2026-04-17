/** Общие правила загрузки (сервер и клиент). */

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export type UploadMediaKind = "image" | "video";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm"
};

export function extensionForMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null;
}

export function classifyUploadMime(mime: string): UploadMediaKind | null {
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
    return "image";
  }
  if ((ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(mime)) {
    return "video";
  }
  return null;
}

export function maxBytesForKind(kind: UploadMediaKind): number {
  return kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
}
