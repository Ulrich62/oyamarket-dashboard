"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { BottomNav } from "./bottom-nav";
import { MediaUploadDrawer } from "@/components/media/media-upload-drawer";
import { PwaNotificationBanner } from "@/components/pwa/pwa-notification-banner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  stores: any[];
  currentStoreId: string;
}

export function DashboardLayout({ children, stores, currentStoreId }: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleOpenMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const handleCloseMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar stores={stores} currentStoreId={currentStoreId} />

      {/* Mobile Slide-Over Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={handleCloseMobileNav}
        stores={stores}
        currentStoreId={currentStoreId}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar
          currentStoreId={currentStoreId}
          onOpenMobileNav={handleOpenMobileNav}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-8 pb-24 md:pb-8">
          <PwaNotificationBanner storeId={currentStoreId} />
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav onOpenMenu={handleOpenMobileNav} />

      {/* Cloudinary Media Upload Drawer Modal */}
      <MediaUploadDrawer />
    </div>
  );
}
