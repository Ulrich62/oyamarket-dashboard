import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MediaUploadDrawer } from "@/components/media/media-upload-drawer";
import { PwaNotificationBanner } from "@/components/pwa/pwa-notification-banner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  stores: any[];
  currentStoreId: string;
}

export function DashboardLayout({ children, stores, currentStoreId }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar stores={stores} currentStoreId={currentStoreId} />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar currentStoreId={currentStoreId} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <PwaNotificationBanner storeId={currentStoreId} />
          {children}
        </main>
      </div>
      <MediaUploadDrawer />
    </div>
  );
}
