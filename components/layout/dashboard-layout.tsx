import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

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
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
