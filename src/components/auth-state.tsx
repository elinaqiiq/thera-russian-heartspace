import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<{
  user: User | null;
  ready: boolean;
  recoveryUserId: string | null;
}>({
  user: null,
  ready: false,
  recoveryUserId: null,
});
export function AuthState({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [recoveryUserId, setRecoveryUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryUserId(session?.user.id ?? null);
      if (event === "SIGNED_OUT" || event === "USER_UPDATED") setRecoveryUserId(null);
      if (
        event === "PASSWORD_RECOVERY" ||
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
      ) {
        setUser(session?.user ?? null);
        setReady(true);
      }
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void router.invalidate();
        if (event === "SIGNED_OUT") queryClient.clear();
        else void queryClient.invalidateQueries();
      }, 0);
    });
    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [router, queryClient]);
  return (
    <AuthContext.Provider value={{ user, ready, recoveryUserId }}>{children}</AuthContext.Provider>
  );
}
export const useAuthState = () => useContext(AuthContext);
