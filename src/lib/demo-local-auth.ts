export type DemoRole = "VISITOR" | "EXHIBITOR";

const DEMO_LS_IS_LOGGED_IN = "isLoggedIn";
const DEMO_LS_ROLE = "role";
const DEMO_LS_EMAIL = "email";
const EXPO365_USER_KEY = "expo365_user";

/** Читаются на сервере в `/api/auth/me` (синхронизация демо-роли с API). */
export const DEMO_COOKIE_ROLE = "expo365_demo_role";
export const DEMO_COOKIE_EMAIL = "expo365_demo_email";
const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function writeDemoCookies(role: DemoRole, email: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${DEMO_COOKIE_ROLE}=${encodeURIComponent(role)};path=/;max-age=${DEMO_COOKIE_MAX_AGE};SameSite=Lax`;
    document.cookie = `${DEMO_COOKIE_EMAIL}=${encodeURIComponent(email)};path=/;max-age=${DEMO_COOKIE_MAX_AGE};SameSite=Lax`;
  } catch {
    // ignore
  }
}

function clearDemoCookies(): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${DEMO_COOKIE_ROLE}=;path=/;max-age=0`;
    document.cookie = `${DEMO_COOKIE_EMAIL}=;path=/;max-age=0`;
  } catch {
    // ignore
  }
}

function notifyAuthChange(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event("expo365-auth-change"));
  } catch {
    // ignore
  }
}

export type DemoUser = {
  email: string;
  role: DemoRole;
  name: string;
};

/** Нормализует устаревшее значение BUYER → VISITOR. */
export function normalizeDemoRole(raw: string | null | undefined): DemoRole | null {
  if (raw === "EXHIBITOR") return "EXHIBITOR";
  if (raw === "VISITOR" || raw === "BUYER") return "VISITOR";
  return null;
}

function persistMigratedUser(user: DemoUser): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EXPO365_USER_KEY, JSON.stringify(user));
    window.localStorage.setItem(DEMO_LS_ROLE, user.role);
  } catch {
    // ignore
  }
}

export function cabinetPathForRole(role: DemoRole): string {
  return role === "EXHIBITOR" ? "/exhibitor/dashboard" : "/visitor/dashboard";
}

/** После `saveDemoSession`: куда вести пользователя (по факту из localStorage). */
export function getPostLoginDashboardPath(fallbackRole: DemoRole): string {
  const s = readDemoSession();
  const r = s.role ?? s.user?.role ?? fallbackRole;
  return r === "EXHIBITOR" ? "/exhibitor/dashboard" : "/visitor/dashboard";
}

/** Сохраняет демо-сессию: объект в expo365_user, флаг isLoggedIn и совместимость со старыми ключами. */
export function saveDemoSession(role: DemoRole, email: string): void {
  if (typeof window === "undefined") return;
  const name = email.split("@")[0] || email;
  const user: DemoUser = { email, role, name };
  try {
    window.localStorage.setItem(EXPO365_USER_KEY, JSON.stringify(user));
    window.localStorage.setItem("isLoggedIn", "true");
    window.localStorage.setItem(DEMO_LS_IS_LOGGED_IN, "true");
    window.localStorage.setItem(DEMO_LS_ROLE, role);
    window.localStorage.setItem(DEMO_LS_EMAIL, email);
    writeDemoCookies(role, email);
    notifyAuthChange();
  } catch {
    // ignore
  }
}

export function readDemoSession(): {
  isLoggedIn: boolean;
  role: DemoRole | null;
  email: string | null;
  user: DemoUser | null;
} {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, role: null, email: null, user: null };
  }
  try {
    const rawUser = window.localStorage.getItem(EXPO365_USER_KEY);
    if (rawUser) {
      const parsed = JSON.parse(rawUser) as Record<string, unknown>;
      const rawRole = typeof parsed.role === "string" ? parsed.role : "";
      const normalized = normalizeDemoRole(rawRole);
      if (parsed && typeof parsed.email === "string" && normalized) {
        const email = parsed.email;
        const user: DemoUser = {
          email,
          role: normalized,
          name:
            typeof parsed.name === "string"
              ? parsed.name
              : email.split("@")[0] || email
        };
        if (rawRole === "BUYER") {
          persistMigratedUser(user);
        }
        return {
          isLoggedIn: true,
          role: user.role,
          email: user.email,
          user
        };
      }
    }
  } catch {
    // fall through to legacy
  }

  const legacyLoggedIn =
    window.localStorage.getItem(DEMO_LS_IS_LOGGED_IN) === "true";
  const legacyRoleRaw = window.localStorage.getItem(DEMO_LS_ROLE);
  const legacyRole = normalizeDemoRole(legacyRoleRaw);
  const legacyEmail = window.localStorage.getItem(DEMO_LS_EMAIL);
  if (legacyLoggedIn && legacyRole && legacyEmail) {
    const name = legacyEmail.split("@")[0] || legacyEmail;
    const user: DemoUser = { email: legacyEmail, role: legacyRole, name };
    if (legacyRoleRaw === "BUYER") {
      persistMigratedUser(user);
    }
    return {
      isLoggedIn: true,
      role: legacyRole,
      email: legacyEmail,
      user
    };
  }
  return { isLoggedIn: false, role: null, email: null, user: null };
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(EXPO365_USER_KEY);
    window.localStorage.removeItem("isLoggedIn");
    window.localStorage.removeItem(DEMO_LS_IS_LOGGED_IN);
    window.localStorage.removeItem(DEMO_LS_ROLE);
    window.localStorage.removeItem(DEMO_LS_EMAIL);
    clearDemoCookies();
    notifyAuthChange();
  } catch {
    // ignore
  }
}

export function isDemoLoggedIn(): boolean {
  return readDemoSession().isLoggedIn;
}

/** Сбрасывает JWT в cookie, чтобы layout кабинетов не редиректил по старой серверной роли поверх демо. */
export async function clearServerSessionCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // ignore
  }
}

export async function saveDemoSessionAfterClearingServerCookie(
  role: DemoRole,
  email: string
): Promise<void> {
  await clearServerSessionCookie();
  saveDemoSession(role, email);
}
