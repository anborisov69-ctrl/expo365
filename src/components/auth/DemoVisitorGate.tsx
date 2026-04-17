"use client";

import { CabinetRoleGuard } from "@/components/auth/CabinetRoleGuard";
import { BuyerCabinetWrapper } from "@/components/visitor/BuyerCabinetWrapper";

export function DemoVisitorGate({ children }: { children: React.ReactNode }) {
  return (
    <CabinetRoleGuard expectedRole="VISITOR">
      <BuyerCabinetWrapper supportMode={null}>{children}</BuyerCabinetWrapper>
    </CabinetRoleGuard>
  );
}
