"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface QRScannerProps {
  onScanSuccess: (payload: any) => void | Promise<void>;
  studentName: string;
  rollNumber: string;
}

export function QRScanner({
  onScanSuccess,
  studentName,
  rollNumber,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  const stopScannerIfRunning = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    const state = scanner.getState();
    if (
      state === Html5QrcodeScannerState.SCANNING ||
      state === Html5QrcodeScannerState.PAUSED
    ) {
      await scanner.stop();
    }
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    if (!isScanning) return;
    let isCancelled = false;

    const startScanning = async () => {
      try {
        setScannerError(null);
        const html5QrCode = new Html5Qrcode("qr-reader", {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          useBarCodeDetectorIfSupported: true,
        });
        scannerRef.current = html5QrCode;

        const scanConfig = {
          fps: 24,
          qrbox: { width: 280, height: 280 },
          disableFlip: true,
        };

        const onDecode = async (decodedText: string) => {
          if (isProcessingRef.current) return;

          isProcessingRef.current = true;
          setIsProcessing(true);
          try {
            let payload: {
              classId: string;
              sessionType: string;
              expiresAtMs: number;
            } | null = null;

            if (decodedText.startsWith("v1|")) {
              const parts = decodedText.split("|");
              if (parts.length === 4) {
                const expiresAtMs = Number(parts[3]);
                if (Number.isFinite(expiresAtMs)) {
                  payload = {
                    classId: parts[1],
                    sessionType: parts[2] || "session",
                    expiresAtMs,
                  };
                }
              }
            } else {
              const rawPayload = JSON.parse(decodedText);
              const rawExpiresAt = rawPayload.exp ?? rawPayload.expiresAt;
              const expiresAtMs =
                typeof rawExpiresAt === "number"
                  ? rawExpiresAt
                  : Date.parse(rawExpiresAt);
              payload = {
                classId: rawPayload.cid ?? rawPayload.classId,
                sessionType: rawPayload.st ?? rawPayload.sessionType ?? "session",
                expiresAtMs,
              };
            }

            if (!payload?.classId || !Number.isFinite(payload.expiresAtMs)) {
              toast.error("Invalid QR code");
              isProcessingRef.current = false;
              setIsProcessing(false);
              return;
            }

            if (Date.now() > payload.expiresAtMs) {
              toast.error("QR code has expired");
              isProcessingRef.current = false;
              setIsProcessing(false);
              return;
            }

            setIsScanning(false);
            const stopPromise = stopScannerIfRunning();
            if (isCancelled) return;

            await Promise.resolve(
              onScanSuccessRef.current({
                ...payload,
                expiresAt: new Date(payload.expiresAtMs).toISOString(),
                studentId: rollNumber,
                studentName: studentName,
              })
            );
            isProcessingRef.current = false;
            setIsProcessing(false);
            await stopPromise;
          } catch (error) {
            console.error("Error processing QR code:", error);
            toast.error("Failed to process QR code");
            isProcessingRef.current = false;
            setIsProcessing(false);
          }
        };

        const cameraTargets: Array<string | { facingMode: string | { exact: string } }> =
          [{ facingMode: { exact: "environment" } }, { facingMode: "environment" }];

        try {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras.length > 0) {
            cameraTargets.push(cameras[0].id);
          }
        } catch (error) {
          console.warn("Unable to enumerate cameras:", error);
        }

        cameraTargets.push({ facingMode: "user" });

        let startError: unknown = null;
        let started = false;

        for (const target of cameraTargets) {
          if (isCancelled) return;
          try {
            await html5QrCode.start(target, scanConfig, onDecode, undefined);
            started = true;
            break;
          } catch (error) {
            startError = error;
          }
        }

        if (!started) {
          throw startError ?? new Error("No camera available");
        }
      } catch (error) {
        console.error("Error starting scanner:", error);
        if (!isCancelled) {
          setIsScanning(false);
          setScannerError(
            "Unable to open camera. Allow camera permission and tap Retry."
          );
          toast.error("Failed to start camera");
        }
      }
    };

    startScanning();

    return () => {
      isCancelled = true;
      void stopScannerIfRunning();
    };
  }, [isScanning, studentName, rollNumber, stopScannerIfRunning]);

  const handleRetry = async () => {
    await stopScannerIfRunning();
    isProcessingRef.current = false;
    setIsProcessing(false);
    setScannerError(null);
    setIsScanning(true);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">Scan QR Code</h2>
      <p className="text-center text-gray-600 mb-4">
        Student: {studentName} ({rollNumber})
      </p>

      <div
        id="qr-reader"
        className="w-full mb-4 rounded-lg overflow-hidden min-h-[260px] sm:min-h-[300px]"
      />

      {!isScanning && (
        <Button onClick={handleRetry} className="w-full" variant="outline">
          Retry
        </Button>
      )}

      {scannerError && (
        <p className="text-sm text-red-600 text-center mt-3">{scannerError}</p>
      )}

      {isProcessing && (
        <p className="text-sm text-blue-600 text-center mt-3">
          Recording attendance...
        </p>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        Position the QR code within the frame. Make sure there is good lighting.
      </p>
    </Card>
  );
}
