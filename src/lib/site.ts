export const THERA_CHAT_URL =
  "https://vdk-viber-runtime-prod.bot.botpress.host/edge/?botId=7ad7759a-ed1b-49d9-83c6-6555daa01224";
export type Psychologist = {
  id: string;
  name: string;
  photo: string;
  qualification: string;
  topics: string[];
  language: string;
  format: string;
  durationMinutes: number;
  priceKzt: number;
};
export const psychologists: Psychologist[] = [];
export const bookingSubmissionsEnabled = false;
export const servicePricing = { chatKzt: 0, consultationIncluded: false };
export function formatKzt(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₸`;
}
export const navItems = [
  { to: "/how-it-works", label: "Как это работает" },
  { to: "/thera", label: "Thera" },
  { to: "/psychologists", label: "Психологи" },
  { to: "/pricing", label: "Тарифы" },
  { to: "/support", label: "Поддержка" },
] as const;
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — TherapyAI` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — TherapyAI` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
