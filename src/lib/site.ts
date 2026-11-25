export const THERA_CHAT_URL =
  "https://vdk-viber-runtime-prod.bot.botpress.host/edge/?botId=7ad7759a-ed1b-49d9-83c6-6555daa01224";
export type Psychologist = {
  id: string;
  name?: string;
  photo?: string;
  qualification?: string;
  topics?: string[];
  language?: string;
  format?: string;
  durationMinutes: number;
  priceKzt: number;
  telegramUsername: string;
  phone: { display: string; number: string };
};
// Full directory: keeps names for past requests. Only `bookable` specialists appear publicly.
export const specialistDirectory: (Psychologist & { bookable: boolean })[] = [
  {
    id: "sovunya-ju",
    name: "Юля",
    bookable: true,
    telegramUsername: "sovunya_ju",
    phone: { display: "+7 705 166 11 32", number: "+77051661132" },
    durationMinutes: 60,
    priceKzt: 10000,
  },
  {
    id: "elina-l-r",
    name: "Элина",
    bookable: false,
    telegramUsername: "elina_l_r",
    phone: { display: "+7 (777) 012-56-48", number: "+77770125648" },
    durationMinutes: 60,
    priceKzt: 10000,
  },
];

export const psychologists: Psychologist[] = specialistDirectory
  .filter((specialist) => specialist.bookable)
  .map(({ bookable: _bookable, ...specialist }) => specialist);

/** Bookable specialist only — use for new requests, links and search params. */
export function findPsychologist(id: unknown) {
  return psychologists.find((psychologist) => psychologist.id === id);
}

/** Any specialist ever listed — use for history and owner views. */
export function findAnySpecialist(id: unknown) {
  return specialistDirectory.find((specialist) => specialist.id === id);
}

export function psychologistLabel(id: string) {
  const psychologist = findAnySpecialist(id);
  return psychologist ? (psychologist.name ?? `@${psychologist.telegramUsername}`) : "Психолог";
}

export function telegramChatUrl(username: string) {
  return `https://t.me/${username}`;
}

export function telegramBookingUrl(username: string) {
  const draft = "Здравствуйте! Хочу записаться на консультацию. Какие есть свободные окна?";
  return `${telegramChatUrl(username)}?text=${encodeURIComponent(draft)}`;
}

export const bookingSubmissionsEnabled = psychologists.length > 0;
export const servicePricing = { chatKzt: 0, consultationIncluded: false };
export function formatKzt(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₸`;
}
export const navItems = [
  { to: "/how-it-works", label: "Как это работает" },
  { to: "/thera", label: "Thera" },
  { to: "/psychologists", label: "Психологи" },
  { to: "/practices", label: "Практики" },
  { to: "/tests", label: "Тесты" },
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
