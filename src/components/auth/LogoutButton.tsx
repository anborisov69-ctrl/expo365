"use client";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className?.trim()
          ? className
          : "rounded-lg border border-expoBlue px-4 py-2 text-sm font-semibold text-expoBlue transition hover:bg-slate-50"
      }
    >
      Выйти
    </button>
  );
}
