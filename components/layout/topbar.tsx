"use client";

import { Search, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaUploader } from "@/lib/store/use-media-uploader";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";

interface TopbarProps {
  currentStoreId?: string;
}

export function Topbar({ currentStoreId }: TopbarProps) {
  const [mounted, setMounted] = useState(false);
  const { openUploader } = useMediaUploader();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-soft bg-bg/80 backdrop-blur-sm px-6">
      <div className="flex flex-1 items-center gap-4 max-w-[480px]">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-ink-3" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-line bg-bg-elev py-2 pl-9 pr-14 text-[13px] text-ink placeholder:text-ink-4 transition-colors duration-150 focus:border-ink-4 focus:bg-bg-elev-2 focus:outline-none"
            placeholder="Search orders, products, customers..."
          />
          {mounted && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <kbd className="inline-flex items-center rounded border border-line px-1.5 font-mono text-[10px] font-medium text-ink-4">
                ⌘ K
              </kbd>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* PWA Install Button */}
        <PwaInstallButton />

        {/* Cloudinary Uploader Trigger Icon Button */}
        <button
          onClick={() => openUploader()}
          title="Uploader un média (Cloudinary)"
          aria-label="Uploader un média sur Cloudinary"
          className="relative text-ink-3 hover:text-ink transition-colors p-2 rounded-lg hover:bg-bg-elev cursor-pointer"
        >
          <UploadCloud className="h-5 w-5" />
        </button>

        <NotificationCenter storeId={currentStoreId} />

        <div className="flex items-center gap-2 border-l border-line pl-3 ml-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
