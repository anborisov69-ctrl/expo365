import { notFound } from "next/navigation";
import { CompanyStandTabs } from "@/components/CompanyStandTabs";
import { prisma } from "@/lib/prisma";

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!company) {
    notFound();
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { viewsCount: { increment: 1 } }
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-expoBlue">Виртуальный стенд: {company.name}</h1>
      <CompanyStandTabs
        company={company}
        products={company.products.map((product) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price.toString()
        }))}
      />
    </section>
  );
}
