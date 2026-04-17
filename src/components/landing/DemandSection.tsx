import Link from "next/link";

export function DemandSection() {
  return (
    <section id="demand" className="scroll-mt-20 border-t border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-expoBlue sm:text-3xl">Лента спроса</h2>
        <p className="mt-3 text-center text-slate-600">
          Смотрите активные заявки покупателей и откликайтесь как экспонент — или создайте свою заявку после входа как
          покупатель.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/demand-feed"
            className="inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-xl border-2 border-[#F26522] bg-white px-8 py-3 text-base font-semibold text-[#F26522] shadow-sm transition hover:bg-orange-50 sm:w-auto"
          >
            Открыть ленту спроса
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-xl bg-expoOrange px-8 py-3 text-base font-semibold text-white shadow-md transition hover:brightness-110 sm:w-auto"
          >
            Регистрация покупателя
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Для просмотра ленты нужна{" "}
          <Link href="/login" className="font-medium text-expoBlue underline-offset-4 hover:underline">
            авторизация
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
