"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { checkInByQr } from "@/lib/api";

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const refreshed = sessionStorage.getItem("scan-refreshed");

    if (!refreshed) {
      sessionStorage.setItem("scan-refreshed", "true");
      window.location.reload();
      return;
    }

    const readerId = "qr-reader";

    const el = document.getElementById(readerId);
    if (el) el.innerHTML = "";

    const scanner = new Html5Qrcode(readerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (processingRef.current) return;

          processingRef.current = true;
          setProcessing(true);

          safeStop(scanner);

          try {
            const result = await checkInByQr(decodedText);

            alert(`✅ Check-in berhasil\n\nNama: ${result.name}`);
          } catch (err: any) {
            if (err.message === "NOT_FOUND") {
              alert("❌ QR ini bukan milik peserta");
            } else if (err.message === "ALREADY_CHECKED_IN") {
              alert("⚠️ Peserta sudah melakukan check-in");
            } else {
              alert("⚠️ Terjadi kesalahan server");
            }
          } finally {
            setProcessing(false);
            processingRef.current = false;

            scanner.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: 250 },
              async () => {},
              () => {}
            );
          }
        },
        () => {}
      )
      .catch((err) => {
        console.error("Camera error:", err);
        alert("❌ Kamera tidak bisa diakses");
      });

    return () => {
      safeStop(scanner);
      sessionStorage.removeItem("scan-refreshed");
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan QR</h1>
      <p className="text-gray-500">
        Arahkan kamera ke QR peserta
      </p>

      <div className="bg-white rounded-lg p-4 shadow">
        <div
          id="qr-reader"
          className="w-full max-w-sm mx-auto"
        />
      </div>

      {processing && (
        <p className="text-center text-sm text-gray-500">
          Memproses QR...
        </p>
      )}
    </div>
  );
}

function safeStop(scanner: Html5Qrcode) {
  try {
    const state = scanner.getState();

    if (state === 2) {
      scanner.stop().then(() => scanner.clear());
    } else {
      scanner.clear();
    }
  } catch {}
}
