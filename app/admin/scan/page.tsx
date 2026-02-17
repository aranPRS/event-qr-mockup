"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { checkInByQr } from "@/lib/api";

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isStoppingRef = useRef(false);
  const errorCountRef = useRef(0);

  const isValidParticipantQR = (text: string): boolean => {
    if (text.startsWith('http://') || text.startsWith('https://')) {
      return false;
    }

    const qrFormat = /^QR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!qrFormat.test(text)) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("scan-refreshed");
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const readerId = "qr-reader";

    const initializeScanner = async () => {
      try {
        const container = document.getElementById(readerId);
        if (container) {
          container.innerHTML = "";
        }

        const scanner = new Html5Qrcode(readerId);
        
        if (!mounted) return;
        
        scannerRef.current = scanner;

        const devices = await Html5Qrcode.getCameras();
        if (devices.length === 0) {
          setError("Tidak ada kamera yang terdeteksi");
          return;
        }

        await scanner.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          handleScanSuccess,
          handleScanError
        );

        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error("Camera initialization error:", err);
        if (mounted) {
          setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        }
      }
    };

    initializeScanner();

    return () => {
      mounted = false;
      safeStop();
    };
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    if (processingRef.current || !scannerRef.current) return;

    processingRef.current = true;
    setProcessing(true);

    try {
      await safeStop();
      
      if (!isValidParticipantQR(decodedText)) {
        alert(`❌ QR Code Tidak Valid\n\nQR Code yang dipindai bukan QR peserta.\n\nFormat yang benar: QR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\n\nIsi QR: ${decodedText.substring(0, 50)}${decodedText.length > 50 ? '...' : ''}`);
        
        setProcessing(false);
        processingRef.current = false;
        
        setTimeout(() => restartScanner(), 1500);
        return;
      }

      const result = await checkInByQr(decodedText);
      
      alert(`✅ Check-in Berhasil\n\nNama: ${result.name}\nQR Code: ${decodedText}`);
      
    } catch (err: any) {
      console.error("Check-in error:", err);
      
      let errorTitle = "⚠️ Error";
      let errorMessage = "Terjadi kesalahan";
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          if (data === "Peserta sudah check-in") {
            errorTitle = "⚠️ Sudah Check-in";
            errorMessage = "Peserta dengan QR ini sudah melakukan check-in sebelumnya.";
          } else {
            errorTitle = "❌ Request Invalid";
            errorMessage = data || "Data yang dikirim tidak valid.";
          }
        } else if (status === 404) {
          errorTitle = "❌ QR Tidak Ditemukan";
          errorMessage = "QR Code ini tidak terdaftar dalam sistem.";
        } else if (status === 500) {
          errorTitle = "❌ Server Error";
          errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        }
      } else if (err.message) {
        if (err.message.includes("Network Error") || err.message.includes("CORS")) {
          errorTitle = "❌ Koneksi Error";
          errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
        } else if (err.message.includes("NOT_FOUND")) {
          errorTitle = "❌ QR Tidak Ditemukan";
          errorMessage = "QR Code ini tidak terdaftar dalam sistem.";
        } else {
          errorMessage = err.message;
        }
      }
      
      alert(`${errorTitle}\n\n${errorMessage}`);
      
    } finally {
      setProcessing(false);
      processingRef.current = false;

      setTimeout(() => restartScanner(), 1500);
    }
  };

  const handleScanError = (error: any) => {
    // Abaikan error parsing QR code karena ini normal ketika tidak ada QR
    if (error?.includes?.("No MultiFormat Readers were able to detect the code")) {
      // Reset error count jika ini error normal
      errorCountRef.current = 0;
      return;
    }

    // Untuk error lainnya, batasi lognya
    if (errorCountRef.current < 3) {
      console.warn("Scan error:", error);
      errorCountRef.current++;
    }
  };

  const restartScanner = async () => {
    if (!scannerRef.current || isStoppingRef.current) return;

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        handleScanSuccess,
        handleScanError
      );
    } catch (err) {
      console.error("Failed to restart scanner:", err);
      setError("Gagal memulai ulang kamera. Refresh halaman.");
    }
  };

  const safeStop = async () => {
    if (!scannerRef.current) return;
    
    isStoppingRef.current = true;
    
    try {
      const scanner = scannerRef.current;
      
      try {
        await scanner.stop();
      } catch (stopErr) {}

      try {
        await scanner.clear();
      } catch (clearErr) {}
      
    } catch (err) {
      console.warn("Stop scanner error:", err);
    } finally {
      isStoppingRef.current = false;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleManualInput = () => {
    const qrCode = prompt("Masukkan QR Code peserta (contoh: QR-16083ab5-f4ef-4b76-ad81-d0b251214f71):");
    if (qrCode && qrCode.trim()) {
      handleScanSuccess(qrCode.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scan QR Code Peserta</h1>
        <button
          onClick={handleManualInput}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Input Manual
        </button>
      </div>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Halaman
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-500">
            Arahkan kamera ke QR code peserta untuk melakukan check-in
          </p>
          <p className="text-xs text-gray-400">
            Format QR: QR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg p-4 shadow">
        <div 
          id="qr-reader" 
          className="w-full max-w-sm mx-auto overflow-hidden"
          style={{ minHeight: '300px' }}
        />
      </div>

      {processing && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Memproses QR Code...</span>
          </div>
        </div>
      )}

      {!isInitialized && !error && (
        <div className="text-center py-4">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-gray-500">Memulai kamera...</p>
        </div>
      )}
    </div>
  );
}