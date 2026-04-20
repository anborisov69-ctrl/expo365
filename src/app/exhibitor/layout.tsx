import type { ReactNode } from "react";

/** Корневой layout: публичная витрина `/exhibitor/[companyId]` без редиректов; кабинет — в `(cabinet)/layout.tsx` */
export default function ExhibitorRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
