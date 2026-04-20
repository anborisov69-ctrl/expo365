import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ExhibitorShowcasePage() {
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

        <h1 className="mt-8 text-xl font-semibold tracking-tight text-neutral-100 sm:text-2xl">Витрина</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
          Здесь будет предпросмотр публичной витрины экспонента (видна посетителям всегда).
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          Публичная витрина: <span className="font-mono text-xs">/company/[id компании]</span> (или{" "}
          <span className="font-mono text-xs">/exhibitor/[id]</span> — тот же контент). Подставьте id из кабинета или
          из базы (cuid).
        </p>
      </div>
    </div>
  );
}
