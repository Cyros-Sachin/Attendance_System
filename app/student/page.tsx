"use client";

import { useEffect, useState } from "react";
import { StudentLogin } from "@/components/student-login";
import { QRScanner } from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface StudentSession {
  name: string;
  rollNumber: string;
}

export default function StudentPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("studentSession");
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch (e) {
        localStorage.removeItem("studentSession");
      }
    }
  }, []);

  const handleLogin = (name: string, rollNumber: string) => {
    const newSession = { name, rollNumber };
    setSession(newSession);
    localStorage.setItem("studentSession", JSON.stringify(newSession));
    toast.success(`Logged in as ${name}`);
  };

  const handleScanSuccess = async (payload: any) => {
    if (!session) return;

    setSubmitting(true);
    try {
      const date = new Date().toISOString().split("T")[0];
      const time = new Date().toTimeString().split(" ")[0];

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: session.rollNumber,
          studentName: session.name,
          classId: payload.classId,
          sessionType: payload.sessionType,
          date,
          time,
          status: "present",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("You have already marked attendance for this class today!");
        } else {
          toast.error(data.error || "Failed to submit attendance");
        }
        setSubmitting(false);
        return;
      }

      setSuccess(data);
      toast.success("Attendance recorded successfully!");

      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Failed to submit attendance");
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("studentSession");
    setSuccess(null);
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-3 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
            Student Attendance
          </h1>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {!session ? (
            <StudentLogin onLogin={handleLogin} />
          ) : success ? (
            <Card className="w-full max-w-md mx-auto p-4 sm:p-6 bg-green-50">
              <div className="text-center space-y-4">
                <div className="text-5xl">✓</div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-700">
                  Attendance Recorded!
                </h3>
                <div className="space-y-2 text-left bg-white p-4 rounded">
                  <p>
                    <strong>Name:</strong> {success.studentName}
                  </p>
                  <p>
                    <strong>Class:</strong> {success.className}
                  </p>
                  <p>
                    <strong>Date:</strong> {success.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {success.time}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="text-green-600">{success.status.toUpperCase()}</span>
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <QRScanner
                onScanSuccess={handleScanSuccess}
                studentName={session.name}
                rollNumber={session.rollNumber}
              />

              <div className="text-center">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full max-w-md"
                  disabled={submitting}
                >
                  Logout
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  You can only log out from this device. Use the same device to scan.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
