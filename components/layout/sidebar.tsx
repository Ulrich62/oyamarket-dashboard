"use client";

import { useState, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  Store as StoreIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { StoreSwitcher } from "./store-switcher";

const MAIN_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Catalogue", href: "/products", icon: Package },
  { name: "Commandes", href: "/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: ChartColumn },
  { name: "Médias", href: "/media", icon: Images },
];

const ORG_LINKS = [
  { name: "Équipe", href: "/team", icon: Users },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function Sidebar({ stores, currentStoreId }: { stores: any[]; currentStoreId: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on tablet screens (768px - 1024px) for optimal workspace
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const currentStore = stores.find((s) => s.storeId === currentStoreId)?.store;

  return (
    <aside 
      className={cn(
        "flex-shrink-0 border-r border-line bg-bg flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="p-3.5 flex flex-col h-full">
        {/* Header / Store switcher */}
        <div className={cn("mb-6 mt-1 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              title={currentStore?.name || "Boutique"}
              className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center hover:bg-accent/20 transition-colors"
            >
              <StoreIcon className="w-5 h-5 text-accent" />
            </button>
          ) : (
            <StoreSwitcher stores={stores} currentStoreId={currentStoreId} />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-6 flex-1">
          <div>
            {!collapsed && (
              <div className="px-2 mb-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-4">Boutique</p>
              </div>
            )}
            <ul className="flex flex-col gap-1">
              {MAIN_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;
                
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      title={collapsed ? link.name : undefined}
                      className={cn(
                        "group relative flex items-center rounded-xl text-[13px] font-medium transition-colors duration-150",
                        collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
                        isActive 
                          ? "bg-bg-elev text-ink font-semibold" 
                          : "text-ink-2 hover:text-ink hover:bg-bg-elev"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                      )} />
                      {!collapsed && <span>{link.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            {!collapsed && (
              <div className="px-2 mb-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-4">Organisation</p>
              </div>
            )}
            <ul className="flex flex-col gap-1">
              {ORG_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      title={collapsed ? link.name : undefined}
                      className={cn(
                        "group relative flex items-center rounded-xl text-[13px] font-medium transition-colors duration-150",
                        collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
                        isActive 
                          ? "bg-bg-elev text-ink font-semibold" 
                          : "text-ink-2 hover:text-ink hover:bg-bg-elev"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                      )} />
                      {!collapsed && <span>{link.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Footer controls: Collapse Toggle & Sign Out */}
        <div className="mt-auto pt-3 border-t border-line flex flex-col gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            className={cn(
              "group flex items-center rounded-xl text-[12px] font-medium transition-colors duration-150 text-ink-4 hover:text-ink hover:bg-bg-elev",
              collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 shrink-0" />
                <span>Réduire le panneau</span>
              </>
            )}
          </button>

          <button 
            onClick={handleLogout}
            title={collapsed ? "Déconnexion" : undefined}
            className={cn(
              "group flex items-center rounded-xl text-[13px] font-medium transition-colors duration-150 text-ink-3 hover:text-red-400 hover:bg-red-500/10",
              collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
