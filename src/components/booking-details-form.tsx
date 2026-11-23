import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { meetingFormats, type MeetingFormat } from "@/lib/consultations";

export function BookingDetailsForm({
  initialFormat,
  initialInstructions,
  pending,
  busy,
  onSave,
}: {
  initialFormat: MeetingFormat | null;
  initialInstructions: string | null;
  pending: boolean;
  busy: boolean;
  onSave: (format: MeetingFormat, instructions: string) => void;
}) {
  const id = useId();
  const [format, setFormat] = useState<MeetingFormat | "">(initialFormat ?? "");
  const [instructions, setInstructions] = useState(initialInstructions ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (format && instructions.trim() && !busy) onSave(format, instructions.trim());
  }

  return (
    <details className="rounded-lg border border-border p-3">
      <summary className="cursor-pointer text-sm font-semibold">
        {pending ? "Подтвердить встречу с деталями" : "Детали встречи"}
      </summary>
      <form className="mt-3 grid gap-3" onSubmit={submit}>
        <label htmlFor={id + "-format"} className="text-sm">
          Формат встречи
        </label>
        <select
          id={id + "-format"}
          className="field"
          value={format}
          required
          disabled={busy}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "" || Object.hasOwn(meetingFormats, value))
              setFormat(value as MeetingFormat | "");
          }}
        >
          <option value="">Выбери формат</option>
          {(Object.keys(meetingFormats) as MeetingFormat[]).map((key) => (
            <option key={key} value={key}>
              {meetingFormats[key]}
            </option>
          ))}
        </select>
        <label htmlFor={id + "-instructions"} className="text-sm">
          Как попасть на консультацию
        </label>
        <textarea
          id={id + "-instructions"}
          className="field"
          value={instructions}
          required
          disabled={busy}
          rows={3}
          maxLength={1000}
          placeholder="Ссылка на видеозвонок, номер телефона или адрес"
          onChange={(event) => setInstructions(event.target.value)}
        />
        <Button type="submit" variant="hero" disabled={busy || !format || !instructions.trim()}>
          {pending ? "Подтвердить встречу" : "Сохранить детали"}
        </Button>
      </form>
    </details>
  );
}
