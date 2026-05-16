import { cn } from "./cn";

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/60",
        className,
      )}
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-stone-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
