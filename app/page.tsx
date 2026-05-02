"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StudentLogin } from "@/components/student-login";
import { toast } from "sonner";

interface UserSession {
  name: string;
  rollNumber: string;
  isAdmin?: boolean;
}

const ADMIN_NAME = "admin@harshit";
const ADMIN_ROLL = "9630511058";
const isAdminCredentials = (name: string, rollNumber: string) =>
  name.trim().toLowerCase() === ADMIN_NAME && rollNumber.trim() === ADMIN_ROLL;

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem("studentSession");
    if (!storedSession) {
      setIsLoading(false);
      return;
    }

    try {
      const parsedSession = JSON.parse(storedSession) as UserSession;
      const hydratedSession: UserSession = {
        ...parsedSession,
        isAdmin: isAdminCredentials(parsedSession.name, parsedSession.rollNumber),
      };
      setSession(hydratedSession);
    } catch {
      localStorage.removeItem("studentSession");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (name: string, rollNumber: string) => {
    const normalizedName = name.trim();
    const normalizedRoll = rollNumber.trim();
    const isAdmin = isAdminCredentials(normalizedName, normalizedRoll);

    const newSession: UserSession = {
      name: normalizedName,
      rollNumber: normalizedRoll,
      isAdmin,
    };

    localStorage.setItem("studentSession", JSON.stringify(newSession));
    setSession(newSession);

    if (isAdmin) {
      toast.success("Welcome admin");
      router.push("/admin");
      return;
    }

    toast.success(`Welcome ${normalizedName}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("studentSession");
    setSession(null);
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Attendance System
          </h1>
          <p className="text-gray-600">QR Code Based Student Tracking</p>
        </div>

        {!session ? (
          <StudentLogin
            onLogin={handleLogin}
            bypassRosterValidation={isAdminCredentials}
          />
        ) : (
          <Card className="p-5 sm:p-8 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Hello, {session.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {session.isAdmin
                  ? "You are logged in as admin."
                  : `Roll Number: ${session.rollNumber}`}
              </p>
            </div>

            {session.isAdmin ? (
              <>
                <Link href="/admin" className="block">
                  <Button className="w-full h-11 sm:h-12 text-base">
                    Open Admin Panel
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button className="w-full h-11 sm:h-12 text-base" variant="outline">
                    Open Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/student" className="block">
                <Button className="w-full h-11 sm:h-12 text-base">
                  Open Camera & Put Attendance
                </Button>
              </Link>
            )}

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full h-11 sm:h-12 text-base"
            >
              Logout
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
