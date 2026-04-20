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
    title: company ? `${company.name} — витрина — Экспо 365` : "Компания — Экспо 365",
    description: company
      ? `Публичная витрина компании «${company.name}» на платформе Экспо 365`
      : "Публичная витрина экспонента"
  };
}

export default async function CompanyShowcaseRoute({ params }: Props) {
  const { companyId } = await params;
  return <CompanyPublicShowcasePage companyId={companyId} />;
}
