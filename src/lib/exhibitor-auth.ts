/** Ключ localStorage для демо-авторизации кабинета экспонента */

export const EXHIBITOR_LOGIN_KEY = "isLoggedIn";

export function getIsExhibitorLoggedIn(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(EXHIBITOR_LOGIN_KEY) === "true";
}

export function setExhibitorLoggedIn(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  if (value) {
    window.localStorage.setItem(EXHIBITOR_LOGIN_KEY, "true");
  } else {
    window.localStorage.removeItem(EXHIBITOR_LOGIN_KEY);
  }
}
