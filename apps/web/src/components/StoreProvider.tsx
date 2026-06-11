"use client";

/**
 * StoreProvider — mounts all global state contexts (UI, User, Map).
 *
 * Add this once at the top of the React tree (app/layout.tsx) so every
 * client component can call useUIStore / useUserStore / useMapStore.
 *
 * When @tanstack/react-query is installed, wrap StoreContextProvider with
 * <QueryClientProvider client={queryClient}> here and remove the manual
 * cache in lib/store/query-client.ts.
 */

import { StoreContextProvider } from "@/lib/store/index";
import type { ReactNode } from "react";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return <StoreContextProvider>{children}</StoreContextProvider>;
}
