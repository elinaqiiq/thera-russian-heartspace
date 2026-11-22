import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { useAuthState } from "@/components/auth-state";
import { Button } from "@/components/ui/button";
import { recordPsychologistVisit } from "@/lib/registry.functions";
import { telegramBookingUrl, type Psychologist } from "@/lib/site";

export function PsychologistTelegramLink({ specialist }: { specialist: Psychologist }) {
  const { user } = useAuthState();
  const record = useServerFn(recordPsychologistVisit);

  function trackVisit() {
    if (!user) return;
    void record({ data: { specialistId: specialist.id } }).catch(() => {
      // A failure to record a visit should never block reaching the psychologist.
    });
  }

  return (
    <>
      <Button variant="hero" size="xl" asChild>
        <a
          href={telegramBookingUrl(specialist.telegramUsername)}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby={`telegram-visit-${specialist.id}`}
          onClick={trackVisit}
          onAuxClick={(event) => {
            if (event.button === 1) trackVisit();
          }}
        >
          <Send size={16} aria-hidden="true" /> Написать психологу в Telegram
        </a>
      </Button>
      <p id={`telegram-visit-${specialist.id}`} className="text-xs leading-5 text-muted-foreground">
        Если ты вошёл в аккаунт, сайт сохранит отметку о переходе.
      </p>
    </>
  );
}
