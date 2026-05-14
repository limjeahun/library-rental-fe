"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartBar, GitBranch, Home, IdCard, Library } from "lucide-react";
import { cn } from "./cn";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/members", label: "Members", icon: IdCard },
  { href: "/rental", label: "Rental", icon: Library },
  { href: "/bestbooks", label: "Best Books", icon: ChartBar },
  { href: "/event-flow", label: "Event Flow", icon: GitBranch },
];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-6">
          <div className="text-lg font-semibold">Library Rental</div>
          <div className="text-xs text-slate-500">EDA Test Console</div>
        </div>
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Backend Integration Console</div>
              <div className="text-xs text-slate-500">DDD + Hexagonal + Next.js App Router</div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">rental:8080</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">book:8081</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">member:8082</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">bestbook:8084</span>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
