import { DemandFeedContent } from "@/components/demand-feed/DemandFeedContent";
import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function DemandFeedPage({ searchParams }: PageProps) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  const sp = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-400">
          Загрузка…
        </div>
      }
    >
      <DemandFeedContent role={session.role} initialCategory={sp.category ?? null} />
    </Suspense>
  );
}
