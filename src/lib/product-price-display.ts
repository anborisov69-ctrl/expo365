/**
 * Форматирование цены для карточек: «1 490 ₽» (пробел перед ₽, разделители тысяч для числа без текста).
 */
export function formatProductPriceDisplay(raw: string): string {
  const t = raw.trim();
  if (!t) {
    return "—";
  }
  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10);
    if (!Number.isNaN(n)) {
      return `${n.toLocaleString("ru-RU").replace(/\u00a0/g, " ")} ₽`;
    }
  }
  return t.replace(/([^\s])(₽)/gu, "$1 ₽");
}
