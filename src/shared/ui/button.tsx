import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
};

const variants = {
  primary: "border-emerald-800 bg-emerald-800 text-white hover:bg-emerald-700",
  secondary: "border-stone-300 bg-white text-stone-900 hover:bg-lime-50",
  ghost: "border-transparent bg-transparent text-stone-700 hover:bg-lime-50",
  danger: "border-red-600 bg-red-600 text-white hover:bg-red-500",
  success: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
