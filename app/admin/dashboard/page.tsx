"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Camera, 
  UserPlus, 
  List,
  RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Participant = {
  id: string;
  name: string;
  email: string;
  isCheckedIn: boolean;
};

export default function DashboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Participants`,
        { 
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (!res.ok) {
        throw new Error("Gagal mengambil data peserta");
      }

      const data = await res.json();
      setParticipants(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      console.error("Error fetching participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const stats = {
    total: participants.length,
    checkedIn: participants.filter(p => p.isCheckedIn).length,
    notCheckedIn: participants.length - participants.filter(p => p.isCheckedIn).length,
  };

  if (loading) {
    return (
      <div className="h-full">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto"> {/* HAPUS: min-h-screen, h-screen, overflow-hidden */}
      <div className="max-w-7xl mx-auto h-full"> {/* HAPUS: bg-gray-50 dan padding */}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="space-y-2 pt-4 px-4 md:pt-6 md:px-6 lg:pt-8 lg:px-8"> {/* TAMBAH padding di sini */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Ringkasan kehadiran event
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-4 md:px-6 lg:px-8 mt-4">
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchParticipants}
                    className="ml-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Main Content Area - Fill remaining space */}
          <div className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8">
            {/* Stats Grid */}
            <div className="pt-4 md:pt-6 lg:pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                  title="Total Peserta"
                  value={stats.total}
                  icon={<Users className="h-5 w-5" />}
                  description="Semua peserta terdaftar"
                />

                <StatCard
                  title="Sudah Hadir"
                  value={stats.checkedIn}
                  icon={<UserCheck className="h-5 w-5" />}
                  description="Telah melakukan check-in"
                  valueClass="text-green-600"
                  trend={stats.total > 0 ? (stats.checkedIn / stats.total * 100).toFixed(1) + "%" : "0%"}
                />

                <StatCard
                  title="Belum Hadir"
                  value={stats.notCheckedIn}
                  icon={<UserX className="h-5 w-5" />}
                  description="Menunggu check-in"
                  valueClass="text-amber-600"
                  trend={stats.total > 0 ? (stats.notCheckedIn / stats.total * 100).toFixed(1) + "%" : "0%"}
                />
              </div>
            </div>

            {/* Quick Actions - Will fill remaining space */}
            <div className="h-full flex items-center justify-center py-8">
              <div className="w-full">
                <h2 className="text-lg md:text-xl font-semibold mb-4">
                  Aksi Cepat
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <ActionButton
                    href="/admin/scan"
                    icon={<Camera className="h-4 w-4 md:h-5 md:w-5" />}
                    label="Scan QR Code"
                    description="Scan QR peserta"
                    variant="primary"
                  />

                  <ActionButton
                    href="/admin/participants"
                    icon={<List className="h-4 w-4 md:h-5 md:w-5" />}
                    label="Lihat Peserta"
                    description="Daftar lengkap peserta"
                    variant="secondary"
                  />

                  <ActionButton
                    href="/admin/participants/create"
                    icon={<UserPlus className="h-4 w-4 md:h-5 md:w-5" />}
                    label="Tambah Peserta"
                    description="Tambahkan peserta baru"
                    variant="secondary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components
function StatCard({
  title,
  value,
  icon,
  description,
  valueClass = "",
  trend,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  valueClass?: string;
  trend?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className={`text-2xl md:text-3xl font-bold ${valueClass}`}>
              {value.toLocaleString()}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          {trend && (
            <div className="text-sm font-medium text-gray-500">
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({
  href,
  icon,
  label,
  description,
  variant = "secondary",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  variant: "primary" | "secondary";
}) {
  const baseClasses = "flex flex-col items-center justify-center p-4 md:p-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]";
  const variantClasses = variant === "primary" 
    ? "bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg"
    : "bg-white border hover:bg-gray-50 text-gray-800 shadow-sm";

  return (
    <Link href={href} className={baseClasses + " " + variantClasses}>
      <div className="mb-2 md:mb-3 p-2 rounded-full bg-gray-100/30">
        {icon}
      </div>
      <span className="font-semibold text-sm md:text-base mb-1">
        {label}
      </span>
      {description && (
        <span className="text-xs text-gray-500 text-center">
          {description}
        </span>
      )}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="h-full p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto h-full">
        <div className="h-full flex flex-col">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 md:h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="mt-6 md:mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full space-y-4">
              <Skeleton className="h-6 w-32 mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}