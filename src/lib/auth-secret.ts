export function getSecretBytes(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export function requireSecretBytes(): Uint8Array {
  const key = getSecretBytes();
  if (!key) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }
  return key;
}
