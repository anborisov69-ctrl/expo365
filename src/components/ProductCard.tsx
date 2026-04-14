import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  sampleAvailable: boolean;
  companyName: string;
}

export function ProductCard({
  id,
  title,
  description,
  category,
  price,
  sampleAvailable,
  companyName
}: ProductCardProps) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-expoBlue">{category}</p>
        <p className="font-semibold">{price} ₽</p>
      </div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <p className="mt-2 text-sm text-slate-500">{companyName}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/products/${id}`} className="rounded border border-expoBlue px-3 py-2 text-sm text-expoBlue">
          Открыть карточку
        </Link>
        <span className="rounded bg-slate-100 px-3 py-2 text-xs">
          {sampleAvailable ? "Образец доступен" : "Без образца"}
        </span>
      </div>
    </article>
  );
}
