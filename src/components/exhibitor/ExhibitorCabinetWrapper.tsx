"use client";

import { SupportModeBanner } from "@/components/admin/SupportModeBanner";
import { ExhibitorInstagramShell } from "@/components/exhibitor/ExhibitorInstagramShell";

export function ExhibitorCabinetWrapper({
  children,
  supportMode
}: {
  children: React.ReactNode;
  supportMode?: { userName: string; userEmail: string | null } | null;
}) {
  const active = Boolean(supportMode);

  return (
    <div className={active ? "pt-14" : ""}>
      {supportMode ? (
        <SupportModeBanner userName={supportMode.userName} userEmail={supportMode.userEmail} />
      ) : null}
      <ExhibitorInstagramShell relevantDemandsCount={0} supportBannerActive={active}>
        {children}
      </ExhibitorInstagramShell>
    </div>
  );
}
