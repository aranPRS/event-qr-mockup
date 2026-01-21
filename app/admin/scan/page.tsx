"use client";

import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanPage() {
  useEffect(() => {
    const refreshed = sessionStorage.getItem("scan-refreshed");

    if (!refreshed) {
      sessionStorage.setItem("scan-refreshed", "true");
      window.location.reload();
      return;
    }

    const readerId = "qr-reader";

    const el = document.getElementById(readerId);
    if (el) {
      el.innerHTML = "";
    }

    const scanner = new Html5Qrcode(readerId);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          console.log("QR RESULT:", decodedText);

          safeStop(scanner);
        },
        () => {}
      )
      .catch((err) => {
        console.error("Camera error:", err);
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
    </div>
  );
}


function safeStop(scanner: Html5Qrcode) {
  const state = scanner.getState();

  if (state === 2) {
    scanner
      .stop()
      .then(() => scanner.clear())
      .catch(() => {});
  } else {
    scanner.clear();
  }
}
