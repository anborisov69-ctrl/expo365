import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import { prisma } from "@/lib/prisma";
import {
  contactsToJson,
  mergeContactsForApi,
  normalizeContactsInput,
  type CompanyContactsPayload
} from "@/lib/company-contacts";
import { Prisma, ProductCategory } from "@prisma/client";

function isValidContactEmail(value: string | null | undefined): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  const t = value.trim();
  if (t === "") {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === "string" && (Object.values(ProductCategory) as string[]).includes(value);
}

export function parseExpertiseCategoriesArray(raw: unknown): ProductCategory[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const next: ProductCategory[] = [];
  for (const item of raw) {
    if (isProductCategory(item)) {
      next.push(item);
    }
  }
  return next;
}

export type CompanyUpdateInput = {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  contacts?: CompanyContactsPayload;
  expertiseCategories?: ProductCategory[];
};

export function parseCompanyUpdateBody(
  record: Record<string, unknown>
): CompanyUpdateInput | { error: string } {
  const out: CompanyUpdateInput = {};

  if ("name" in record) {
    if (typeof record.name !== "string") {
      return { error: "Некорректное поле name" };
    }
    out.name = record.name.trim();
  }

  if ("description" in record) {
    if (record.description === null) {
      out.description = null;
    } else if (typeof record.description === "string") {
      const t = record.description.trim();
      out.description = t === "" ? null : t;
    } else {
      return { error: "Некорректное поле description" };
    }
  }

  const logoRaw = record.logoUrl ?? record.logo;
  if ("logoUrl" in record || "logo" in record) {
    if (logoRaw === null || logoRaw === "") {
      out.logoUrl = null;
    } else if (typeof logoRaw === "string") {
      const t = logoRaw.trim();
      out.logoUrl = t === "" ? null : t;
    } else {
      return { error: "Некорректное поле logo / logoUrl" };
    }
  }

  if ("website" in record) {
    if (record.website === null) {
      out.website = null;
    } else if (typeof record.website === "string") {
      const t = record.website.trim();
      out.website = t === "" ? null : t;
    } else {
      return { error: "Некорректное поле website" };
    }
  }

  if ("contacts" in record) {
    if (record.contacts === null) {
      out.contacts = {
        phone: null,
        email: null,
        address: null,
        website: null
      };
    } else {
      const n = normalizeContactsInput(record.contacts);
      if (n === null) {
        return { error: "Некорректное поле contacts" };
      }
      out.contacts = n;
    }
  }

  if ("expertiseCategories" in record) {
    if (!Array.isArray(record.expertiseCategories)) {
      return { error: "Некорректный список expertiseCategories" };
    }
    out.expertiseCategories = parseExpertiseCategoriesArray(record.expertiseCategories);
  }

  return out;
}

export function isUpdateEmpty(parsed: CompanyUpdateInput): boolean {
  return Object.keys(parsed).length === 0;
}

export async function buildCompanyUpdateData(
  companyId: string,
  parsed: CompanyUpdateInput
): Promise<{ error?: string; data?: Prisma.CompanyUpdateInput }> {
  const existing = await prisma.company.findUnique({
    where: { id: companyId },
    select: { website: true, contacts: true }
  });
  if (!existing) {
    return { error: "Компания не найдена" };
  }

  const data: Prisma.CompanyUpdateInput = {};

  if (parsed.name !== undefined) {
    if (parsed.name.length === 0) {
      return { error: "Укажите название компании" };
    }
    data.name = parsed.name;
  }

  if (parsed.description !== undefined) {
    data.description = parsed.description;
  }

  if (parsed.logoUrl !== undefined) {
    data.logoUrl = parsed.logoUrl;
  }

  if (parsed.expertiseCategories !== undefined) {
    data.expertiseCategories = JSON.stringify(parsed.expertiseCategories);
  }

  if (parsed.contacts !== undefined || parsed.website !== undefined) {
    let merged = mergeContactsForApi(existing.website, existing.contacts as Prisma.JsonValue | null);
    if (parsed.website !== undefined) {
      merged = { ...merged, website: parsed.website };
    }
    if (parsed.contacts !== undefined) {
      const pc = parsed.contacts;
      merged = {
        phone: pc.phone ?? merged.phone,
        email: pc.email ?? merged.email,
        address: pc.address ?? merged.address,
        website: pc.website ?? merged.website
      };
    }
    if (!isValidContactEmail(merged.email)) {
      return { error: "Некорректный email в контактах" };
    }
    const c = contactsToJson(merged);
    data.contacts = c.contacts;
    data.website = c.website;
  }

  return { data };
}

export const companySelectApiFields = {
  id: true,
  name: true,
  logoUrl: true,
  description: true,
  website: true,
  contacts: true,
  expertiseCategories: true,
  updatedAt: true
} satisfies Prisma.CompanySelect;

export function companyRowToJson(company: {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  contacts: Prisma.JsonValue | null;
  expertiseCategories: string;
  updatedAt?: Date;
}) {
  let expertise: ProductCategory[] = [];
  try {
    const raw = JSON.parse(company.expertiseCategories || "[]") as unknown;
    expertise = parseExpertiseCategoriesArray(raw);
  } catch {
    expertise = [];
  }
  return {
    id: company.id,
    name: company.name,
    logo: company.logoUrl,
    logoUrl: company.logoUrl,
    description: company.description,
    website: company.website,
    contacts: mergeContactsForApi(company.website, company.contacts),
    expertiseCategories: expertise,
    updatedAt: company.updatedAt
  };
}

export type CompanyPublicApi = ReturnType<typeof companyRowToJson>;

export function companyApiToExhibitorProps(api: CompanyPublicApi): ExhibitorProfileCompanyProps {
  return {
    id: api.id,
    name: api.name,
    logoUrl: api.logoUrl,
    description: api.description,
    website: api.website,
    contacts: api.contacts,
    expertiseCategories: api.expertiseCategories
  };
}
