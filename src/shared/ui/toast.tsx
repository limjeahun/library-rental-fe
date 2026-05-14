"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(
    () => ({
      notifySuccess: (message: string) => push("success", message),
      notifyError: (message: string) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = toast.kind === "success" ? CheckCircle2 : XCircle;
          return (
            <div
              key={toast.id}
              className="flex items-start gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-lg"
            >
              <Icon
                className={toast.kind === "success" ? "mt-0.5 text-emerald-600" : "mt-0.5 text-rose-600"}
                size={18}
              />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("ToastProvider가 설정되지 않았습니다.");
  }
  return value;
}
