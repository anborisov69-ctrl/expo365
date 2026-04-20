import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SpecialOffersCabinetClient } from "@/components/exhibitor/SpecialOffersCabinetClient";

export default function ExhibitorSpecialOffersPage() {
  return (
    <div className="min-h-screen bg-black pb-24 font-sans text-neutral-100 antialiased">
      <div className="mx-auto max-w-[935px] px-4 py-6 sm:px-6 sm:pt-8">
        <Link
          href="/exhibitor/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0095F6] transition hover:text-[#47a7ff]"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          Назад в кабинет
        </Link>
        <h1 className="mt-8 text-xl font-semibold tracking-tight text-neutral-100 sm:text-2xl">
          Спецпредложения
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Скрытые предложения для авторизованных партнёров (публичная витрина:{" "}
          <span className="font-mono text-xs text-neutral-500">/company/[id]</span>).
        </p>
        <div className="mt-8">
          <SpecialOffersCabinetClient />
        </div>
      </div>
    </div>
  );
}
