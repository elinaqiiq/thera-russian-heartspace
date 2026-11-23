export const consultationStatuses = {
  pending: "Ожидает подтверждения",
  confirmed: "Встреча подтверждена",
  declined: "Отклонена",
  cancelled: "Отменена",
  completed: "Консультация завершена",
  no_show: "Встреча не состоялась",
} as const;

export type ConsultationStatus = keyof typeof consultationStatuses;

export const bookingDecisions = ["confirmed", "declined", "completed", "no_show"] as const;
export type BookingDecision = (typeof bookingDecisions)[number];

export const meetingFormats = {
  online: "Видеозвонок",
  phone: "Телефон",
  in_person: "Лично",
} as const;
export type MeetingFormat = keyof typeof meetingFormats;

export type RescheduleStatus = "pending" | "accepted" | "declined";

export const consultationTimeZone = "Asia/Almaty";

export function consultationStart(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):00$/.test(time)) return null;
  // Almaty has used UTC+05:00 since March 2024. Booking only accepts future dates.
  const instant = new Date(`${date}T${time}:00+05:00`);
  if (Number.isNaN(instant.getTime())) return null;
  const localDate = new Date(instant.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return date === localDate ? instant.toISOString() : null;
}
