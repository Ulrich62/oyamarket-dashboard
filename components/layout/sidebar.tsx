"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ChartColumn, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const MAIN_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: ChartColumn },
];

const ORG_LINKS = [
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="w-[240px] flex-shrink-0 border-r border-line bg-bg flex flex-col justify-between hidden md:flex">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-8 px-2 mt-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-bg font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-ink text-sm">OyaMarket</span>
        </div>

        <nav className="flex flex-col gap-6 flex-1">
          <div>
            <div className="px-2 mb-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-4">Store</p>
            </div>
            <ul className="flex flex-col gap-1">
              {MAIN_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;
                
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group relative flex items-center rounded-md text-[14px] font-medium transition-colors duration-150 gap-2.5 px-2.5 py-[7px]",
                        isActive 
                          ? "bg-bg-elev text-ink" 
                          : "text-ink-2 hover:text-ink hover:bg-bg-elev"
                      )}
                    >
                      <Icon className={cn(
                        "w-[14px] h-[14px] shrink-0",
                        isActive ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                      )} />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="px-2 mb-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-4">Organization</p>
            </div>
            <ul className="flex flex-col gap-1">
              {ORG_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group relative flex items-center rounded-md text-[14px] font-medium transition-colors duration-150 gap-2.5 px-2.5 py-[7px]",
                        isActive 
                          ? "bg-bg-elev text-ink" 
                          : "text-ink-2 hover:text-ink hover:bg-bg-elev"
                      )}
                    >
                      <Icon className={cn(
                        "w-[14px] h-[14px] shrink-0",
                        isActive ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                      )} />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="mt-auto pt-4 border-t border-line">
          <button 
            onClick={handleLogout}
            className="w-full group flex items-center rounded-md text-[14px] font-medium transition-colors duration-150 gap-2.5 px-2.5 py-[7px] text-ink-2 hover:text-ink hover:bg-bg-elev"
          >
            <LogOut className="w-[14px] h-[14px] shrink-0 text-ink-3 group-hover:text-ink-2" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
