import { prisma } from "@/lib/prisma";
import { parseExpertiseCategoriesJson } from "@/lib/expertise-categories";
import { DemandStatus, type Prisma, type ProductCategory } from "@prisma/client";

function buildRelevantOpenDemandsWhere(
  companyId: string,
  expertiseCategoriesJson: string | null | undefined
): Prisma.DemandRequestWhereInput {
  const expertise = parseExpertiseCategoriesJson(expertiseCategoriesJson);
  return {
    status: DemandStatus.ACTIVE,
    ...(expertise.length === 0 ? {} : { category: { in: expertise } }),
    bids: { none: { companyId } }
  };
}

export interface RelevantDemandSummary {
  id: string;
  title: string;
  category: ProductCategory;
  createdAt: Date;
}

export async function getRelevantOpenDemandsForCompany(
  companyId: string,
  take: number
): Promise<RelevantDemandSummary[]> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { expertiseCategories: true }
  });
  const where = buildRelevantOpenDemandsWhere(companyId, company?.expertiseCategories);
  const rows = await prisma.demandRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true
    }
  });
  return rows;
}

export async function countRelevantOpenDemandsForCompany(companyId: string): Promise<number> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { expertiseCategories: true }
  });
  const where = buildRelevantOpenDemandsWhere(companyId, company?.expertiseCategories);
  return prisma.demandRequest.count({ where });
}
