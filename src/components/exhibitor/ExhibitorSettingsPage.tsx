"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setExhibitorLoggedIn } from "@/lib/exhibitor-auth";
import { exhibitorH1, exhibitorPageWrap } from "@/components/exhibitor/exhibitor-ui";

export function ExhibitorSettingsPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [notifyRequests, setNotifyRequests] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    window.alert("Настройки сохранены (демо)");
  }

  return (
    <div className="min-h-screen bg-exhibitorBg">
      <div className={`${exhibitorPageWrap} mx-auto max-w-lg`}>
        <h1 className={exhibitorH1}>Настройки</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section
            className="rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover"
          >
            <h2 className="text-base font-semibold text-expoBlue">Смена пароля</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="pw1" className="block text-sm font-medium text-slate-600">
                  Новый пароль
                </label>
                <input
                  id="pw1"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-expoBlue/40 focus:outline-none focus:ring-2 focus:ring-expoBlue/15"
                />
              </div>
              <div>
                <label htmlFor="pw2" className="block text-sm font-medium text-slate-600">
                  Подтверждение
                </label>
                <input
                  id="pw2"
                  type="password"
                  autoComplete="new-password"
                  value={password2}
                  onChange={(event) => setPassword2(event.target.value)}
                  className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-expoBlue/40 focus:outline-none focus:ring-2 focus:ring-expoBlue/15"
                />
              </div>
            </div>
          </section>

          <section
            className="rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover"
          >
            <h2 className="text-base font-semibold text-expoBlue">Уведомления</h2>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={notifyRequests}
                onChange={(event) => setNotifyRequests(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-expoOrange focus:ring-expoOrange"
              />
              <span className="text-sm text-slate-700">Получать уведомления о новых запросах</span>
            </label>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={notifyDigest}
                onChange={(event) => setNotifyDigest(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-expoOrange focus:ring-expoOrange"
              />
              <span className="text-sm text-slate-700">Получать дайджест раз в неделю</span>
            </label>
          </section>

          <button
            type="submit"
            className="w-full rounded-[8px] bg-expoOrange py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Сохранить настройки
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setExhibitorLoggedIn(false);
            router.push("/login");
          }}
          className="mt-6 w-full rounded-[8px] border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          Выйти (демо)
        </button>
      </div>
    </div>
  );
}
