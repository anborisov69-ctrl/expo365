import Link from "next/link";

export default function HomePage() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-expoBlue">Платформа ЭКСПО 365</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        B2B-экосистема для выставок: цифровые стенды, лента новинок, запросы коммерческих предложений и образцов.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/register" className="rounded bg-expoOrange px-4 py-2 text-white">
          Зарегистрироваться
        </Link>
        <Link href="/feed" className="rounded border border-expoBlue px-4 py-2 text-expoBlue">
          Смотреть новинки
        </Link>
      </div>
    </section>
  );
}
