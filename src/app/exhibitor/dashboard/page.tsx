import Link from "next/link";
import { ExhibitorDashboardClient } from "@/components/ExhibitorDashboardClient";

export default function ExhibitorDashboardPage() {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-expoBlue">Кабинет экспонента</h1>
        <Link href="/exhibitor/stand" className="rounded bg-expoOrange px-4 py-2 text-white">
          Управлять стендом
        </Link>
      </div>
      <ExhibitorDashboardClient />
    </section>
  );
}
