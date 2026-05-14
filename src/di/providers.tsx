"use client";

import { createContainer, type AppContainer } from "@di/container";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import { ToastProvider } from "@shared/ui/toast";

const ContainerContext = createContext<AppContainer | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const container = useMemo(() => createContainer(), []);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            gcTime: 5 * 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ContainerContext.Provider value={container}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ContainerContext.Provider>
  );
}

export function useAppContainer() {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error("AppProviders가 설정되지 않았습니다.");
  }
  return container;
}
