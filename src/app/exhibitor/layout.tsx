import { DemoExhibitorGate } from "@/components/auth/DemoExhibitorGate";
import { ExhibitorCabinetWrapper } from "@/components/exhibitor/ExhibitorCabinetWrapper";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ExhibitorLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  if (session?.role === "VISITOR") {
    redirect("/visitor/dashboard");
  }
  if (session?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  if (session?.role === "EXHIBITOR") {
    const profile = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { name: true, email: true }
    });

    const supportMode =
      session.impersonatedBy && profile
        ? { userName: profile.name, userEmail: profile.email }
        : null;

    return (
      <ExhibitorCabinetWrapper supportMode={supportMode}>{children}</ExhibitorCabinetWrapper>
    );
  }

  return <DemoExhibitorGate>{children}</DemoExhibitorGate>;
}
