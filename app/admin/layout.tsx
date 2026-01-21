import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-6 text-xl font-bold">
          Event Admin
        </div>

        <nav className="px-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="block rounded px-3 py-2 hover:bg-gray-100"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/admin/scan"
            className="block rounded px-3 py-2 hover:bg-gray-100"
          >
            📷 Scan QR
          </Link>

          <Link
            href="/admin/participants"
            className="block rounded px-3 py-2 hover:bg-gray-100"
          >
            👥 Peserta
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
