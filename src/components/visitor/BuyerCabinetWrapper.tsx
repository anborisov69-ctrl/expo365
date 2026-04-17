"use client";

import { VisitorShell } from "@/components/visitor/VisitorShell";

export function BuyerCabinetWrapper({
  children,
  supportMode
}: {
  children: React.ReactNode;
  supportMode?: { userName: string; userEmail: string | null } | null;
}) {
  return <VisitorShell supportMode={supportMode}>{children}</VisitorShell>;
}
