/** Ключ localStorage для демо-входа экспонента (без серверной сессии) */
export const EXHIBITOR_LOGGED_IN_STORAGE_KEY = "isExhibitorLoggedIn";

export function readExhibitorLoggedInFlag(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(EXHIBITOR_LOGGED_IN_STORAGE_KEY) === "true";
}

export function setExhibitorLoggedInFlag(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  if (value) {
    window.localStorage.setItem(EXHIBITOR_LOGGED_IN_STORAGE_KEY, "true");
  } else {
    window.localStorage.removeItem(EXHIBITOR_LOGGED_IN_STORAGE_KEY);
  }
}
