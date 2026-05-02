"use client";

import { useEffect, useState } from "react";
import { AttendanceStats } from "@/components/attendance-stats";
import { AttendanceRecords } from "@/components/attendance-records";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  teacher: string;
  session: string;
  date: string;
  time: string;
  timestamp: string;
  status: string;
}

interface Class {
  id: string;
  name: string;
  teacher: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAttendanceRecords(), fetchClasses()]);
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch("/api/attendance");
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records");
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    Promise.all([fetchAttendanceRecords(), fetchClasses()]).then(() => {
      setIsLoading(false);
      toast.success("Data refreshed");
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
            Dashboard
          </h1>
          <div className="flex w-full sm:w-auto gap-2">
            <Button onClick={handleRefresh} variant="outline" className="flex-1 sm:flex-none">
              Refresh
            </Button>
            <Link href="/" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full sm:max-w-md grid-cols-2">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-6">
            {records.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">
                  No attendance records yet. Start scanning QR codes to see statistics here.
                </p>
              </div>
            ) : (
              <AttendanceStats records={records} />
            )}
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <AttendanceRecords records={records} classes={classes} />
          </TabsContent>
        </Tabs>

        {/* Info Footer */}
        <div className="mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Attendance System Info</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Total Attendance Records: {records.length}</li>
            <li>
              • Total Classes: {classes.length}
            </li>
            <li>
              • Unique Students:{" "}
              {new Set(records.map((r) => r.studentId)).size}
            </li>
            <li>
              • Last Updated:{" "}
              {records.length > 0
                ? new Date(
                    records[0].timestamp
                  ).toLocaleString()
                : "N/A"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
