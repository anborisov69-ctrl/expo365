import { AdminImpersonateButton } from "@/components/admin/AdminImpersonateButton";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const q = ((await searchParams).q ?? "").trim();

  const users = await prisma.user.findMany({
    where: {
      role: { in: [Role.EXHIBITOR, Role.VISITOR] },
      ...(q
        ? {
            OR: [
              { email: { contains: q } },
              { name: { contains: q } },
              { visitorCompany: { contains: q } },
              { company: { name: { contains: q } } }
            ]
          }
        : {})
    },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      visitorCompany: true,
      company: { select: { name: true } }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Панель администратора</h1>
          <Link
            href="/admin/logout"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Выйти
          </Link>
        </div>

        <form method="get" className="mt-8 flex flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Поиск по email, имени, компании…"
            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-expoBlue px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Найти
          </button>
        </form>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3 font-medium">Компания</th>
                <th className="px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const companyLabel =
                    u.role === Role.EXHIBITOR
                      ? (u.company?.name ?? "—")
                      : (u.visitorCompany ?? "—");
                  return (
                    <tr key={u.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                      <td className="px-4 py-3 text-slate-700">{u.email ?? "—"}</td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3 text-slate-600">{companyLabel}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {u.role === Role.EXHIBITOR ? (
                            <AdminImpersonateButton userId={u.id} role="EXHIBITOR">
                              Войти как экспонент
                            </AdminImpersonateButton>
                          ) : null}
                          {u.role === Role.VISITOR ? (
                            <AdminImpersonateButton userId={u.id} role="VISITOR">
                              Войти как посетитель
                            </AdminImpersonateButton>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
