import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { prisma } from "@/lib/prisma";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { company: true }
  });

  if (!product) {
    notFound();
  }

  return (
    <article className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-expoBlue">{product.category}</p>
      <h1 className="mt-2 text-2xl font-bold">{product.title}</h1>
      <p className="mt-2 text-slate-600">{product.description}</p>
      <p className="mt-4 text-lg font-semibold">{product.price.toString()} ₽</p>
      <Link href={`/companies/${product.companyId}`} className="mt-3 inline-block text-sm text-expoBlue underline">
        Перейти к виртуальному стенду {product.company.name}
      </Link>
      <ProductActions productId={product.id} sampleAvailable={product.sampleAvailable} />
    </article>
  );
}
