import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getUserStores, requireStoreId } from "@/lib/actions/store-context";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stores = await getUserStores();
  let currentStoreId = "";
  try {
    currentStoreId = await requireStoreId();
  } catch {
    // Aucune boutique
  }

  return <DashboardLayout stores={stores} currentStoreId={currentStoreId}>{children}</DashboardLayout>;
}
