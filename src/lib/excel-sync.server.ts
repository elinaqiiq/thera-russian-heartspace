import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { registryDatabase } from "./registry.functions";
import { registrySchema } from "./registry";
import { buildRegistryWorkbook } from "./registry-workbook";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

async function matchesSecret(value: string, secret: string) {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all(
    [value, secret].map((input) => crypto.subtle.digest("SHA-256", encoder.encode(input))),
  );
  const first = new Uint8Array(a!);
  return (
    new Uint8Array(b!).reduce((difference, item, i) => difference | (item ^ first[i]!), 0) === 0
  );
}

export async function readExcelSync(request: Request) {
  const secret = process.env["THERA_EXCEL_SYNC_TOKEN"];
  if (!secret || secret.length < 32) return new Response(null, { status: 503, headers });
  const auth = request.headers.get("Authorization");
  if (
    !auth?.startsWith("Bearer ") ||
    auth.length > 1024 ||
    !(await matchesSecret(auth.slice(7), secret))
  ) {
    return new Response(null, { status: 401, headers });
  }

  try {
    const result = await registryDatabase(supabaseAdmin).rpc("thera_registry_export", {});
    if (result.error) return new Response(null, { status: 503, headers });
    const workbook = await buildRegistryWorkbook(registrySchema.parse(result.data));
    return new Response(workbook, {
      headers: {
        ...headers,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="thera-registry.xlsx"',
      },
    });
  } catch {
    return new Response(null, { status: 503, headers });
  }
}
