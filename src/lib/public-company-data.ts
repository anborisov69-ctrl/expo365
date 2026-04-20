import { companyRowToJson } from "@/lib/company-update-shared";
import { mergeContactsForApi } from "@/lib/company-contacts";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function telegramFromContacts(contacts: Prisma.JsonValue | null): string | null {
  if (contacts === null || typeof contacts !== "object" || Array.isArray(contacts)) {
    return null;
  }
  const t = (contacts as Record<string, unknown>).telegram;
  return typeof t === "string" && t.trim() ? t.trim() : null;
}

export async function getPublicCompanyPayload(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      description: true,
      website: true,
      contacts: true,
      expertiseCategories: true,
      updatedAt: true
    }
  });

  if (!company) {
    return null;
  }

  const session = await getSessionFromCookies();
  const ownCompanyId = await getCompanyIdForExhibitorSession(session);
  const exhibitorOwnsShowcase =
    session?.role === "EXHIBITOR" && ownCompanyId !== null && ownCompanyId === companyId;

  const [products, services] = await Promise.all([
    prisma.product.findMany({
      where: {
        companyId,
        ...(exhibitorOwnsShowcase ? {} : { isPublished: true })
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.service.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const specialOffers =
    session &&
    (await prisma.specialOffer.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: "desc" }
    }));

  const companyJson = companyRowToJson(company);

  return {
    company: companyJson,
    contacts: mergeContactsForApi(company.website, company.contacts),
    telegram: telegramFromContacts(company.contacts),
    products,
    services,
    specialOffers: specialOffers ?? [],
    _meta: {
      authenticated: Boolean(session),
      isVisitor: session?.role === "VISITOR",
      isAdmin: session?.role === "ADMIN"
    }
  };
}
