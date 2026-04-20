import { Prisma } from "@prisma/client";

export type CompanyContactsPayload = {
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
};

export function emptyContacts(websiteFallback: string | null): CompanyContactsPayload {
  return {
    phone: null,
    email: null,
    address: null,
    website: websiteFallback
  };
}

export function normalizeContactsInput(raw: unknown): CompanyContactsPayload | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const str = (key: string): string | null => {
    const v = o[key];
    if (v === null || v === undefined) {
      return null;
    }
    if (typeof v !== "string") {
      return null;
    }
    const t = v.trim();
    return t === "" ? null : t;
  };
  return {
    phone: str("phone"),
    email: str("email"),
    address: str("address"),
    website: str("website")
  };
}

/** Собирает объект для поля Company.contacts и синхронизирует колонку website. */
export function contactsToJson(
  contacts: CompanyContactsPayload | null
): { contacts: Prisma.InputJsonValue | typeof Prisma.JsonNull; website: string | null } {
  if (!contacts) {
    return { contacts: Prisma.JsonNull, website: null };
  }
  const website = contacts.website;
  const payload = {
    phone: contacts.phone,
    email: contacts.email,
    address: contacts.address,
    website: contacts.website
  };
  const hasAny = Object.values(payload).some((v) => v !== null && v !== "");
  if (!hasAny) {
    return { contacts: Prisma.JsonNull, website: null };
  }
  return { contacts: payload as Prisma.InputJsonValue, website: website };
}

export function mergeContactsForApi(
  websiteColumn: string | null,
  contacts: Prisma.JsonValue | null
): CompanyContactsPayload {
  const parsed =
    contacts !== null &&
    typeof contacts === "object" &&
    !Array.isArray(contacts) &&
    normalizeContactsInput(contacts);
  if (!parsed) {
    return emptyContacts(websiteColumn);
  }
  return {
    phone: parsed.phone,
    email: parsed.email,
    address: parsed.address,
    website: parsed.website ?? websiteColumn
  };
}
