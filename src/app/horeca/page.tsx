import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { HorecaCatalogClient } from "./HorecaCatalogClient";

export default function HorecaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingTopNav />
      <main className="flex-1">
        <HorecaCatalogClient />
      </main>
      <footer className="border-t border-slate-200 bg-slate-50 py-5 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} ЭКСПО 365 — каталог экспонентов HoReCa</p>
      </footer>
    </div>
  );
}
