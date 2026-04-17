import { ExhibitorCompanySettingsForm } from "@/components/exhibitor/ExhibitorCompanySettingsForm";
import { parseCompanyExpertiseCategories } from "@/lib/company-expertise";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";

export default async function ExhibitorSettingsPage() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "EXHIBITOR") {
    redirect("/login");
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.sub },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      description: true,
      website: true,
      expertiseCategories: true
    }
  });

  if (!company) {
    redirect("/register");
  }

  const expertiseCategories = parseCompanyExpertiseCategories(company.expertiseCategories);

  return (
    <ExhibitorCompanySettingsForm
      initialCompany={{
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        description: company.description,
        website: company.website,
        expertiseCategories
      }}
    />
  );
}
