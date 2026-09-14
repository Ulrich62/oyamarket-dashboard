"use client";

import { Search, UploadCloud, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaUploader } from "@/lib/store/use-media-uploader";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";

interface TopbarProps {
  currentStoreId?: string;
  onOpenMobileNav?: () => void;
}

export function Topbar({ currentStoreId, onOpenMobileNav }: TopbarProps) {
  const [mounted, setMounted] = useState(false);
  const { openUploader } = useMediaUploader();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-soft bg-bg/85 backdrop-blur-md px-3 sm:px-6 gap-2">
      {/* Left: Hamburger (mobile) + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-[480px]">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 -ml-1 text-ink-3 hover:text-ink rounded-lg hover:bg-bg-elev transition-colors shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-ink-3" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-line bg-bg-elev py-1.5 sm:py-2 pl-8 sm:pl-9 pr-3 sm:pr-14 text-[12px] sm:text-[13px] text-ink placeholder:text-ink-4 transition-colors duration-150 focus:border-ink-4 focus:bg-bg-elev-2 focus:outline-none truncate"
            placeholder="Rechercher..."
          />
          {mounted && (
            <div className="absolute inset-y-0 right-0 hidden sm:flex items-center pr-2">
              <kbd className="inline-flex items-center rounded border border-line px-1.5 font-mono text-[10px] font-medium text-ink-4">
                ⌘ K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* PWA Install Button */}
        <PwaInstallButton />

        {/* Cloudinary Uploader Trigger Icon Button */}
        <button
          onClick={() => openUploader()}
          title="Uploader un média (Cloudinary)"
          aria-label="Uploader un média sur Cloudinary"
          className="relative text-ink-3 hover:text-ink transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-bg-elev cursor-pointer"
        >
          <UploadCloud className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>

        {/* Notification Bell */}
        <NotificationCenter storeId={currentStoreId} />

        {/* User Avatar */}
        <div className="flex items-center gap-2 border-l border-line pl-2 sm:pl-3 ml-0.5 sm:ml-1">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] sm:text-xs font-bold shadow-md select-none">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
