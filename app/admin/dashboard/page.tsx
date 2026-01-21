import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Ringkasan kehadiran event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm text-gray-500">Total Peserta</p>
          <p className="text-3xl font-bold mt-2">120</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm text-gray-500">Sudah Hadir</p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            78
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm text-gray-500">Belum Hadir</p>
          <p className="text-3xl font-bold mt-2 text-orange-500">
            42
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Link
            href="/admin/scan"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 hover:bg-gray-800"
          >
            📷 Scan QR
          </Link>

          <Link
            href="/admin/participants/create"
            className="inline-flex items-center justify-center rounded-md border px-6 py-3 hover:bg-gray-50"
          >
            ➕ Tambah Peserta
          </Link>
        </div>
      </div>
    </div>
  );
}
