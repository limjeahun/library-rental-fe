"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartBar, GitBranch, Home, IdCard, Library } from "lucide-react";
import { cn } from "./cn";

const navItems = [
  { href: "/", label: "업무 현황", icon: Home },
  { href: "/members", label: "회원", icon: IdCard },
  { href: "/books", label: "도서", icon: BookOpen },
  { href: "/rental", label: "대여 창구", icon: Library },
  { href: "/bestbooks", label: "인기 도서", icon: ChartBar },
  { href: "/event-flow", label: "이벤트 추적", icon: GitBranch },
];

const serviceChips = ["rental:8080", "book:8081", "member:8082", "bestbook:8084"];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[220px] bg-slate-900 px-3 py-4 text-white lg:block">
        <div className="mb-6 px-2">
          <div className="text-base font-semibold">Library Rental</div>
          <div className="text-xs text-slate-400">Circulation Desk</div>
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
                  active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-[220px]">
        <header className="sticky top-0 z-20 flex h-12 items-center border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">도서관 대여 운영 콘솔</div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {serviceChips.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {service}
                </span>
              ))}
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
