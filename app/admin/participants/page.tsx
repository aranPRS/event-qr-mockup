"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getParticipants } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX,
  Download,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Participant = {
  id: string;
  name: string;
  email: string | null;
  isCheckedIn: boolean;
  createdAt: string;
  checkedInAt: string | null;
};

type SortField = "name" | "createdAt" | "checkedInAt";
type SortDirection = "asc" | "desc";

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const router = useRouter();

  // Fetch data
  useEffect(() => {
    loadParticipants();
  }, []);

  async function loadParticipants() {
    try {
      setLoading(true);
      setError("");
      const data = await getParticipants();
      setParticipants(data);
    } catch (err) {
      setError("Gagal mengambil data peserta");
      console.error("Error loading participants:", err);
    } finally {
      setLoading(false);
    }
  }

  // Apply filters and sorting
  useEffect(() => {
    let result = [...participants];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.email && p.email.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(p => 
        statusFilter === "checkedIn" ? p.isCheckedIn : !p.isCheckedIn
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "checkedInAt":
          aValue = a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0;
          bValue = b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0;
          break;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredParticipants(result);
  }, [participants, searchTerm, statusFilter, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => ({
    total: participants.length,
    checkedIn: participants.filter(p => p.isCheckedIn).length,
    notCheckedIn: participants.length - participants.filter(p => p.isCheckedIn).length,
  }), [participants]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Nama", "Email", "Status", "Dibuat", "Check-in"];
    const csvData = filteredParticipants.map(p => [
      p.name,
      p.email || "-",
      p.isCheckedIn ? "Hadir" : "Belum",
      formatDate(p.createdAt),
      formatDate(p.checkedInAt)
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peserta-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 ml-1 opacity-30" />;
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" /> 
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  if (loading && participants.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Daftar Peserta</h1>
          <p className="text-gray-500">List seluruh peserta event</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Memuat data peserta...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Daftar Peserta</h1>
          <p className="text-gray-500">List seluruh peserta event</p>
        </div>
        
        <div className="flex gap-2">
         <Button
        variant="outline"
        onClick={() => router.push("/admin/participants/create")}
      >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Peserta
      </Button>


          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredParticipants.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={loadParticipants}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Peserta</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sudah Check-in</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Belum Check-in</p>
                <p className="text-2xl font-bold text-amber-600">{stats.notCheckedIn}</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <UserX className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="checkedIn">Sudah Check-in</SelectItem>
                  <SelectItem value="notCheckedIn">Belum Check-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <Button variant="outline" size="sm" onClick={loadParticipants}>
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center font-medium text-gray-600 hover:text-gray-900"
                    >
                      Nama
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center font-medium text-gray-600 hover:text-gray-900"
                    >
                      Dibuat
                      <SortIcon field="createdAt" />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort("checkedInAt")}
                      className="flex items-center font-medium text-gray-600 hover:text-gray-900"
                    >
                      Check-in
                      <SortIcon field="checkedInAt" />
                    </button>
                  </th>
                </tr>
              </thead>
              
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Tidak ada peserta ditemukan</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm || statusFilter !== "all" 
                            ? "Coba ubah filter atau kata kunci pencarian" 
                            : "Belum ada peserta yang terdaftar"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant, index) => (
                    <tr 
                      key={participant.id} 
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="p-4 font-medium">{participant.name}</td>
                      <td className="p-4 text-gray-600">{participant.email || "-"}</td>
                      <td className="p-4">
                        <Badge 
                          variant={participant.isCheckedIn ? "default" : "secondary"}
                          className={participant.isCheckedIn 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          }
                        >
                          {participant.isCheckedIn ? "Hadir" : "Belum"}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(participant.createdAt)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(participant.checkedInAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredParticipants.length > 0 && (
            <div className="border-t px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600">
              <div>
                Menampilkan <span className="font-medium">{filteredParticipants.length}</span> dari{" "}
                <span className="font-medium">{participants.length}</span> peserta
              </div>
              <div className="mt-2 sm:mt-0">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Pencarian: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}