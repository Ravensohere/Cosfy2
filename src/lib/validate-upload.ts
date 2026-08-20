const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const DOC_TYPES = [...IMAGE_TYPES, "application/pdf"];
const AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/x-m4a"];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DOC_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB

export const UPLOAD_KIND = {
  image: { types: IMAGE_TYPES, maxBytes: MAX_IMAGE_BYTES },
  document: { types: DOC_TYPES, maxBytes: MAX_DOC_BYTES },
  audio: { types: AUDIO_TYPES, maxBytes: MAX_AUDIO_BYTES },
} as const;

export type UploadKind = keyof typeof UPLOAD_KIND;

export function validateUpload(
  file: File,
  kind: UploadKind
): { ok: true } | { ok: false; error: string } {
  const { types, maxBytes } = UPLOAD_KIND[kind];

  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `File is too large (max ${Math.floor(maxBytes / (1024 * 1024))}MB).` };
  }
  if (file.type && !types.includes(file.type)) {
    return { ok: false, error: "Unsupported file type." };
  }

  return { ok: true };
}
