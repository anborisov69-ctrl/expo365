import Link from "next/link";

export default function BuyerFavoritesPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Избранное</h1>
      <p className="text-sm text-slate-500">
        Здесь появятся сохранённые новинки. Раздел в разработке.
      </p>
      <Link href="/feed" className="inline-block text-sm font-medium text-[#F26522] hover:underline">
        Перейти к ленте новинок
      </Link>
    </div>
  );
}
