import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="min-h-screen flex p-4">
    <div className="glass rounded-3xl flex w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-6">
        <Topbar />
        {children}
      </main>
    </div>
  </div>
);
}
