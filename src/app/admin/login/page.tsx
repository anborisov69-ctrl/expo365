import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const session = await getSessionFromCookies();
  if (session?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
