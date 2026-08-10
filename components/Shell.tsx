import { Sidebar } from "@/components/Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 py-5">{children}</main>
    </div>
  );
}
