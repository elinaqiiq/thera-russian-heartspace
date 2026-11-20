// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { readExcelSync } from "@/lib/excel-sync.server";
import { buildRegistryWorkbook } from "@/lib/registry-workbook";

afterEach(() => vi.unstubAllEnvs());

it("creates an XLSX workbook even before any users or requests exist", async () => {
  const workbook = await buildRegistryWorkbook({ users: [], requests: [] });
  const bytes = new Uint8Array(await workbook.arrayBuffer());
  expect(Array.from(bytes.subarray(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
});

it("keeps the automated export private when no key or a wrong key is supplied", async () => {
  const url = "https://thera.invalid/api/excel-sync";
  vi.stubEnv("THERA_EXCEL_SYNC_TOKEN", "");
  expect((await readExcelSync(new Request(url))).status).toBe(503);
  vi.stubEnv("THERA_EXCEL_SYNC_TOKEN", "test-secret-not-a-real-secret".repeat(2));
  expect((await readExcelSync(new Request(url))).status).toBe(401);
  const rejected = await readExcelSync(
    new Request(url, {
      headers: { Authorization: "Bearer wrong-token" },
    }),
  );
  expect(rejected.status).toBe(401);
  expect(rejected.headers.get("Cache-Control")).toBe("private, no-store");
});
