"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChartColumn,
  Images,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { StoreSwitcher } from "./store-switcher";

const MAIN_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Catalogue", href: "/products", icon: Package },
  { name: "Commandes", href: "/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: ChartColumn },
  { name: "Médiathèque", href: "/media", icon: Images },
];

const ORG_LINKS = [
  { name: "Équipe", href: "/team", icon: Users },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  stores: any[];
  currentStoreId: string;
}

export function MobileNav({ isOpen, onClose, stores, currentStoreId }: MobileNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close nav only when pathname actually changes
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  if (!mounted || !isOpen) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className="relative flex flex-col w-[300px] max-w-[85vw] h-full bg-[#0d0d0f] border-r border-line text-ink z-10 shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation mobile"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-line flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <StoreSwitcher stores={stores} currentStoreId={currentStoreId} />
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-elev transition-colors shrink-0"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 flex flex-col gap-6">
          <div>
            <div className="px-2 mb-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-4">Boutique</p>
            </div>
            <ul className="flex flex-col gap-1">
              {MAIN_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center rounded-xl text-[14px] font-medium transition-colors gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-accent/10 text-accent font-semibold"
                          : "text-ink-2 hover:text-ink hover:bg-bg-elev active:bg-bg-elev-2"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                        )}
                      />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="px-2 mb-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-4">Organisation</p>
            </div>
            <ul className="flex flex-col gap-1">
              {ORG_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center rounded-xl text-[14px] font-medium transition-colors gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-accent/10 text-accent font-semibold"
                          : "text-ink-2 hover:text-ink hover:bg-bg-elev active:bg-bg-elev-2"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                        )}
                      />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Drawer Footer / User Info & Sign Out */}
        <div className="mt-auto p-4 border-t border-line bg-bg-elev/30 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">Admin OyaMarket</p>
              <p className="text-xs text-ink-4 truncate">adimiulrich06@gmail.com</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}
