import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/premium-preview")({
  beforeLoad: () => {
    throw redirect({ to: "/tests", hash: "premium-tests", replace: true });
  },
});
