"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addParticipant } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UserPlus, 
  ArrowLeft, 
  CheckCircle,
  Loader2,
  Mail,
  User
} from "lucide-react";

export default function AddParticipantPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fungsi validasi email sederhana
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validasi
    if (!name.trim()) {
      setError("Nama wajib diisi");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Format email tidak valid");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addParticipant(name, email);
      setSuccess(true);

      // Redirect ke list peserta setelah 2 detik
      setTimeout(() => {
        router.push("/admin/participants");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menambahkan peserta");
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    router.push("/admin/participants");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        {/* Header dengan tombol kembali */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/participants">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Tambah Peserta Baru
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Tambahkan peserta baru ke dalam sistem event
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Form Tambah Peserta
                </CardTitle>
                <CardDescription>
                  Isi data peserta dengan lengkap. Semua field wajib diisi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nama Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nama Peserta
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap peserta"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError(""); // Clear error saat user mulai ketik
                        }}
                        className="pl-10"
                        disabled={loading || success}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Nama akan muncul pada sertifikat dan badge peserta
                    </p>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contoh@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(""); // Clear error saat user mulai ketik
                        }}
                        className="pl-10"
                        disabled={loading || success}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Email digunakan untuk mengirim konfirmasi dan sertifikat
                    </p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setError("")}
                          className="h-6 px-2 text-red-800 hover:bg-red-100"
                        >
                          Tutup
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success Alert */}
                  {success && (
                    <Alert className="bg-green-50 border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Peserta berhasil ditambahkan! Mengalihkan ke halaman daftar peserta...
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || success || !name.trim() || !email.trim()}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Berhasil Disimpan
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Simpan Peserta
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Informasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Persyaratan
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2 pl-6 list-disc">
                    <li><span className="font-medium">Nama:</span> Wajib diisi</li>
                    <li><span className="font-medium">Email:</span> Wajib diisi dengan format valid</li>
                    <li><span className="font-medium">Format email:</span> contoh@domain.com</li>
                    <li>Pastikan email aktif untuk menerima konfirmasi</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-sm mb-2">Validasi Data</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 ${name.trim() ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`h-2 w-2 rounded-full ${name.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Nama sudah diisi</span>
                    </div>
                    <div className={`flex items-center gap-2 ${email.trim() && isValidEmail(email) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`h-2 w-2 rounded-full ${email.trim() && isValidEmail(email) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Email valid</span>
                    </div>
                    <div className={`flex items-center gap-2 ${name.trim() && email.trim() && isValidEmail(email) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`h-2 w-2 rounded-full ${name.trim() && email.trim() && isValidEmail(email) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Siap disimpan</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-sm mb-3">Aksi Cepat</h3>
                  <div className="space-y-2">
                    <Link href="/admin/participants">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Lihat Semua Peserta
                      </Button>
                    </Link>
                    <Link href="/admin/scan">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Scan QR Check-in
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Back Button */}
        <div className="lg:hidden mt-6">
          <Link href="/admin/participants">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Peserta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}