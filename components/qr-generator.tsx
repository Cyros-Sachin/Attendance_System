"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Class {
  id: string;
  name: string;
  teacher: string;
}

interface QRGeneratorProps {
  classes: Class[];
}

export function QRGenerator({ classes }: QRGeneratorProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [sessionType, setSessionType] = useState<string>("session");
  const [expiryMinutes, setExpiryMinutes] = useState<number>(10);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrSize, setQrSize] = useState(360);
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQRCode = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/qr-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          sessionType,
          expiryMinutes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to generate QR code");
        setIsGenerating(false);
        return;
      }

      setQrPayload(data.qrPayload);
      setTimeLeft(expiryMinutes * 60);
      toast.success("QR code generated successfully!");
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQrPayload(null);
          toast.error("QR code has expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const updateQrSize = () => {
      setQrSize(window.innerWidth < 640 ? 260 : 360);
    };

    updateQrSize();
    window.addEventListener("resize", updateQrSize);

    return () => {
      window.removeEventListener("resize", updateQrSize);
    };
  }, []);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qr-${selectedClassId}-${new Date().getTime()}.png`;
    link.click();
  };

  const printQRCode = () => {
    if (!qrRef.current) return;

    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) {
      toast.error("Failed to open print window");
      return;
    }

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    printWindow.document.write("<html><head><title>QR Code</title></head><body>");
    printWindow.document.write(`<h1>Attendance QR Code</h1>`);
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    if (selectedClass) {
      printWindow.document.write(`<p><strong>Class:</strong> ${selectedClass.name}</p>`);
      printWindow.document.write(`<p><strong>Teacher:</strong> ${selectedClass.teacher}</p>`);
      printWindow.document.write(`<p><strong>Type:</strong> ${sessionType}</p>`);
    }
    printWindow.document.write(`<div style="text-align: center;">`);
    printWindow.document.write(canvas.outerHTML);
    printWindow.document.write(`</div>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Generate QR Code</h2>

      {!qrPayload ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Class
            </label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.teacher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Session Type</label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="session">Regular Session</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Expiry Time (minutes)
            </label>
            <Select
              value={expiryMinutes.toString()}
              onValueChange={(val) => setExpiryMinutes(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateQRCode}
            disabled={!selectedClassId || isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 mb-2">Time Remaining:</div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(timeLeft / (expiryMinutes * 60)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div
            ref={qrRef}
            className="flex justify-center bg-white p-3 sm:p-4 rounded-lg overflow-x-auto"
          >
            <QRCodeCanvas
              value={qrPayload}
              size={qrSize}
              level="L"
              includeMargin={true}
            />
          </div>

          <div className="text-center text-sm text-gray-600 space-y-1">
            <p>
              <strong>Class:</strong>{" "}
              {classes.find((c) => c.id === selectedClassId)?.name}
            </p>
            <p>
              <strong>Teacher:</strong>{" "}
              {classes.find((c) => c.id === selectedClassId)?.teacher}
            </p>
            <p>
              <strong>Type:</strong> {sessionType}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={downloadQRCode} variant="outline" className="flex-1">
              Download
            </Button>
            <Button onClick={printQRCode} variant="outline" className="flex-1">
              Print
            </Button>
          </div>

          <Button
            onClick={() => {
              setQrPayload(null);
              setTimeLeft(0);
            }}
            variant="secondary"
            className="w-full"
          >
            Generate New QR Code
          </Button>
        </div>
      )}
    </Card>
  );
}
