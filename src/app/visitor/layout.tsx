import { DemoVisitorGate } from "@/components/auth/DemoVisitorGate";
import { BuyerCabinetWrapper } from "@/components/visitor/BuyerCabinetWrapper";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session-server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function VisitorLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  if (session?.role === "EXHIBITOR") {
    redirect("/exhibitor/dashboard");
  }
  if (session?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  if (session?.role === "VISITOR") {
    const profile = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { name: true, email: true }
    });

    const supportMode =
      session.impersonatedBy && profile
        ? { userName: profile.name, userEmail: profile.email }
        : null;

    return <BuyerCabinetWrapper supportMode={supportMode}>{children}</BuyerCabinetWrapper>;
  }

  return <DemoVisitorGate>{children}</DemoVisitorGate>;
}
