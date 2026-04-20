import { CompanyPublicShowcasePage } from "@/components/exhibitor/CompanyPublicShowcasePage";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

type Props = { params: Promise<{ companyId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true }
  });
  return {
    title: company ? `${company.name} — витрина — Экспо 365` : "Витрина экспонента — Экспо 365",
    description: company
      ? `Публичная витрина «${company.name}» на Экспо 365`
      : "Публичная витрина экспонента"
  };
}

/** Совместимость: тот же контент, что и `/company/[companyId]`. */
export default async function PublicExhibitorShowcasePage({ params }: Props) {
  const { companyId } = await params;
  return <CompanyPublicShowcasePage companyId={companyId} />;
}
