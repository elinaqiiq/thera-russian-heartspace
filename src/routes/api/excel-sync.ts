import { createFileRoute } from "@tanstack/react-router";
import { readExcelSync } from "@/lib/excel-sync.server";

export const Route = createFileRoute("/api/excel-sync")({
  server: { handlers: { GET: ({ request }) => readExcelSync(request) } },
});
