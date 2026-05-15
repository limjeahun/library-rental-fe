import { cn } from "./cn";

const toneByValue: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  UNAVAILABLE: "bg-red-100 text-red-700 ring-red-200",
  ENTERED: "bg-slate-100 text-slate-700 ring-slate-200",
  RENT_AVAILABLE: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  RENT_UNAVAILABLE: "bg-red-100 text-red-700 ring-red-200",
  OVERDUE: "bg-amber-100 text-amber-700 ring-amber-200",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        toneByValue[value] ?? "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {value}
    </span>
  );
}
