"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChartColumn,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onOpenMenu: () => void;
}

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: "Accueil", href: "/", icon: LayoutDashboard },
    { name: "Commandes", href: "/orders", icon: ShoppingCart },
    { name: "Catalogue", href: "/products", icon: Package },
    { name: "Analytics", href: "/analytics", icon: ChartColumn },
  ];

  return (
    <nav
      aria-label="Navigation mobile principale"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-line/80 px-2 pt-1 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all duration-150 active:scale-95",
                isActive ? "text-accent" : "text-ink-3 hover:text-ink-2"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent animate-in zoom-in duration-200" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight mt-1 font-medium truncate",
                  isActive ? "text-accent font-semibold" : "text-ink-4"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Menu button to open the full drawer */}
        <button
          onClick={onOpenMenu}
          aria-label="Ouvrir le menu complet"
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl text-ink-3 hover:text-ink-2 transition-all duration-150 active:scale-95"
        >
          <div className="relative flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1 font-medium text-ink-4">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
