import { ExhibitorCompanySettingsForm } from "@/components/exhibitor/ExhibitorCompanySettingsForm";
import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";

export default async function ExhibitorSettingsPage() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "EXHIBITOR") {
    redirect("/login");
  }

  return <ExhibitorCompanySettingsForm />;
}
