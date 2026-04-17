"use client";

import type { DemoRole } from "@/lib/demo-local-auth";
import { readDemoSession } from "@/lib/demo-local-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CabinetRoleGuard({
  expectedRole,
  children
}: {
  expectedRole: DemoRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const { isLoggedIn, role } = readDemoSession();
    if (!isLoggedIn || role !== expectedRole) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [expectedRole, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
        Проверка доступа…
      </div>
    );
  }

  return <>{children}</>;
}
