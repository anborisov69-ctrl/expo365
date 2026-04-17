import Link from "next/link";

export function LandingHero() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-expoBlue sm:text-4xl md:text-5xl">
          ЭКСПО 365: Ваша непрерывная выставка в HoReCa
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-slate-600 sm:text-xl">
          Ваша единая платформа снабжения. 6 уникальных B2B модулей
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#demand"
            className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center rounded-xl bg-expoOrange px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-expoOrange/25 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-expoBlue"
          >
            Начать
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center rounded-xl border-2 border-[#F26522] bg-white px-8 py-3.5 text-base font-semibold text-[#F26522] shadow-sm transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26522]"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center rounded-xl border-2 border-expoBlue bg-white px-8 py-3.5 text-base font-semibold text-expoBlue shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-expoBlue"
          >
            Регистрация
          </Link>
        </div>
      </div>
    </section>
  );
}
