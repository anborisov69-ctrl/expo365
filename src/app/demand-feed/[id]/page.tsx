import { DemandFeedDetailContent } from "@/components/demand-feed/DemandFeedDetailContent";
import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function DemandFeedDetailPage({ params }: PageProps) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  const { id } = await params;
  return <DemandFeedDetailContent id={id} role={session.role} />;
}
