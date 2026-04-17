import Link from "next/link";

export function DemoFooterNav() {
  return (
    <nav
      className="mx-auto mt-12 max-w-6xl border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-600 sm:px-6"
      aria-label="Навигация по демо"
    >
      <p className="mb-3 font-medium text-expoBlue">Демо-навигация</p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href="/" className="underline decoration-expoOrange/50 underline-offset-4 hover:text-expoBlue">
          Главная
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href="/feed" className="underline decoration-expoOrange/50 underline-offset-4 hover:text-expoBlue">
          Лента новинок
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href="/stand/example" className="underline decoration-expoOrange/50 underline-offset-4 hover:text-expoBlue">
          Виртуальный стенд
        </Link>
      </div>
    </nav>
  );
}
