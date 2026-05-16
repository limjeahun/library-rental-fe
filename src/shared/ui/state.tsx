export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-stone-300 bg-lime-50/60 p-4 text-sm text-stone-500">
      {message}
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {message}
    </div>
  );
}
