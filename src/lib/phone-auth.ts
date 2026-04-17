/**
 * Нормализация российского номера для входа и уникальности в БД (формат +7XXXXXXXXXX).
 */
export function normalizeLoginPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    digits = `7${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }
  return null;
}

export function isEmailLike(value: string): boolean {
  return value.includes("@");
}
