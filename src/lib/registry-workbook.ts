import type { Registry } from "./registry";
import { psychologists } from "./site";

const almatyDate = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Almaty",
});
const timestamp = (value: string | null) => (value ? almatyDate.format(new Date(value)) : null);

export async function buildRegistryWorkbook({ users, requests, visits }: Registry) {
  const { default: writeExcelFile } = await import("write-excel-file/universal");
  return writeExcelFile([
    {
      sheet: "Регистрации",
      stickyRowsCount: 1,
      columns: [{ width: 40 }, { width: 36 }, { width: 28 }, { width: 28 }],
      data: [
        ["ID аккаунта", "Email", "Регистрация (Алматы)", "Подтверждение email (Алматы)"],
        ...users.map(({ id, email, created_at, confirmed_at }) => [
          id,
          email,
          timestamp(created_at),
          timestamp(confirmed_at),
        ]),
      ],
    },
    {
      sheet: "Заявки к психологу",
      stickyRowsCount: 1,
      columns: [
        { width: 40 },
        { width: 40 },
        { width: 36 },
        { width: 24 },
        { width: 24 },
        { width: 26 },
      ],
      data: [
        [
          "ID заявки",
          "ID аккаунта",
          "Email",
          "Telegram клиента",
          "Психолог",
          "Отправка заявки (Алматы)",
        ],
        ...requests.map(({ id, user_id, email, telegram_username, specialist_id, created_at }) => [
          id,
          user_id,
          email,
          telegram_username ? "@" + telegram_username : null,
          psychologists.find((p) => p.id === specialist_id)?.telegramUsername ?? specialist_id,
          timestamp(created_at),
        ]),
      ],
    },
    {
      sheet: "Переходы в Telegram",
      stickyRowsCount: 1,
      columns: [{ width: 40 }, { width: 40 }, { width: 36 }, { width: 24 }, { width: 26 }],
      data: [
        ["ID перехода", "ID аккаунта", "Email", "Психолог", "Переход (Алматы)"],
        ...visits.map(({ id, user_id, email, specialist_id, created_at }) => [
          id,
          user_id,
          email,
          psychologists.find((p) => p.id === specialist_id)?.telegramUsername ?? specialist_id,
          timestamp(created_at),
        ]),
      ],
    },
  ]).toBlob();
}
