import { HomeEcosystem } from "@/components/landing/HomeEcosystem";
import { LandingTopNav } from "@/components/landing/LandingTopNav";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingTopNav />
      <HomeEcosystem />
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} ЭКСПО 365 — B2B-платформа</p>
      </footer>
    </div>
  );
}
