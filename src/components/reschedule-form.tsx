import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { consultationStart } from "@/lib/consultations";

export function RescheduleForm({
  currentStart,
  busy,
  onSubmit,
}: {
  currentStart: string;
  busy: boolean;
  onSubmit: (proposedStart: string) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const proposedStart = consultationStart(date, time);
  const usable =
    proposedStart &&
    Date.parse(proposedStart) > Date.now() &&
    Date.parse(proposedStart) !== Date.parse(currentStart);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (usable && !busy) onSubmit(proposedStart);
  }

  return (
    <details className="mt-2 rounded-lg border border-border p-3">
      <summary className="cursor-pointer text-sm font-semibold">Предложить другое время</summary>
      <form onSubmit={submit} className="mt-3 grid gap-3">
        <p className="text-sm text-muted-foreground">
          Исходное время сохраняется, пока психолог не подтвердит перенос.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-sm">
            Новая дата
            <input
              className="field mt-1 min-w-0"
              type="date"
              required
              value={date}
              disabled={busy}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label className="min-w-0 text-sm">
            Новое время (Алматы)
            <select
              className="field mt-1"
              required
              value={time}
              disabled={busy}
              onChange={(event) => setTime(event.target.value)}
            >
              <option value="">Выбери время</option>
              {Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`).map(
                (hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        {date && time && !usable && (
          <p className="text-sm text-destructive">Выбери другое время в будущем.</p>
        )}
        <Button type="submit" size="sm" variant="soft" disabled={!usable || busy}>
          Запросить перенос
        </Button>
      </form>
    </details>
  );
}
