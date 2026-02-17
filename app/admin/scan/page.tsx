"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isStoppingRef = useRef(false);

  const isValidParticipantQR = (text: string): boolean => {
    if (text.startsWith('http://') || text.startsWith('https://')) {
      return false;
    }

    const qrFormat = /^QR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return qrFormat.test(text);
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
          () => {} // Ignore scan error
        );

        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (mounted) {
          setError("Gagal mengakses kamera");
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
        alert("❌ QR Code tidak valid");
        setTimeout(() => restartScanner(), 1500);
        return;
      }

      // Pake fetch langsung
      const response = await fetch('https://event.taufiqthareq.my.id/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode: decodedText })
      });

      const data = await response.text();

      if (response.ok) {
        // Success 200
        alert(`✅ Check-in Berhasil`);
      } else if (response.status === 400 && data === "Peserta sudah check-in") {
        // Sudah check-in
        alert(`⚠️ Peserta sudah check-in`);
      } else {
        // Error lain
        alert(`❌ Gagal: ${data}`);
      }
      
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessing(false);
      processingRef.current = false;
      setTimeout(() => restartScanner(), 1500);
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
        () => {}
      );
    } catch (err) {
      console.error("Failed to restart scanner:", err);
      setError("Gagal memulai ulang kamera");
    }
  };

  const safeStop = async () => {
    if (!scannerRef.current) return;
    
    isStoppingRef.current = true;
    
    try {
      const scanner = scannerRef.current;
      try { await scanner.stop(); } catch {}
      try { await scanner.clear(); } catch {}
    } catch (err) {
      console.warn("Stop error:", err);
    } finally {
      isStoppingRef.current = false;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleManualInput = () => {
    const qrCode = prompt("Masukkan QR Code:");
    if (qrCode?.trim()) {
      handleScanSuccess(qrCode.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scan QR Code</h1>
        <button
          onClick={handleManualInput}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Input Manual
        </button>
      </div>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>
      ) : (
        <p className="text-gray-500">
          Arahkan kamera ke QR code peserta
        </p>
      )}

      <div className="bg-white rounded-lg p-4 shadow">
        <div 
          id="qr-reader" 
          className="w-full max-w-sm mx-auto overflow-hidden"
          style={{ minHeight: '300px' }}
        />
      </div>

      {processing && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
            Memproses...
          </div>
        </div>
      )}
    </div>
  );
}