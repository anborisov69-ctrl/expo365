import { DemandCreateForm } from "@/components/visitor/DemandCreateForm";
import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";

export default function DemandCreatePage() {
  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center">
          <SiteHeaderLogo href="/" variant="compact" />
        </div>
        <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wide text-[#F26522]">
          Лента спроса
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold text-slate-900">Новая заявка</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Опишите потребность — заявка появится в кабинете и в списке заявок.
        </p>
        <div className="mt-8">
          <DemandCreateForm />
        </div>
      </div>
    </div>
  );
}
