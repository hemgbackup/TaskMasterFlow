import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TopBar />
        {children}
      </main>
    </div>
  );
}