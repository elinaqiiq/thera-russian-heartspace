import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkRegistryAccess, exportRegistry } from "@/lib/registry.functions";
import { buildRegistryWorkbook } from "@/lib/registry-workbook";

export function RegistryExport() {
  const check = useServerFn(checkRegistryAccess);
  const read = useServerFn(exportRegistry);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    check()
      .then(({ allowed }) => {
        if (mounted) setAllowed(allowed);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [check]);

  async function download() {
    setBusy(true);
    setError(false);
    try {
      const url = URL.createObjectURL(await buildRegistryWorkbook(await read()));
      const link = document.createElement("a");
      link.href = url;
      link.download = "thera-registry.xlsx";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) return null;
  return (
    <section className="soft-card mb-6 p-5">
      <h2 className="text-lg font-bold">Отчёт для владельца</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Регистрации, заявки и переходы к психологу после входа в аккаунт.
      </p>
      <Button
        type="button"
        variant="soft"
        disabled={busy}
        className="mt-4"
        onClick={() => void download()}
      >
        <Download aria-hidden="true" /> {busy ? "Готовим файл…" : "Скачать Excel"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Не удалось выгрузить отчёт.
        </p>
      )}
    </section>
  );
}
