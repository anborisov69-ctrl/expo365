import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

/** Каноническая ссылка /demand/[id]: покупатель — кабинет, экспонент — лента спроса с откликом */
export default async function DemandEntryPage({ params }: PageProps) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  const { id } = await params;
  if (session.role === "EXHIBITOR") {
    redirect(`/demand-feed/${id}`);
  }
  redirect(`/visitor/requests/${id}`);
}
