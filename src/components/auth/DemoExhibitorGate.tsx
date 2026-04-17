"use client";

import { CabinetRoleGuard } from "@/components/auth/CabinetRoleGuard";
import { ExhibitorCabinetWrapper } from "@/components/exhibitor/ExhibitorCabinetWrapper";

export function DemoExhibitorGate({ children }: { children: React.ReactNode }) {
  return (
    <CabinetRoleGuard expectedRole="EXHIBITOR">
      <ExhibitorCabinetWrapper supportMode={null}>{children}</ExhibitorCabinetWrapper>
    </CabinetRoleGuard>
  );
}
