"use client";

import { useEffect, useState } from "react";
import { ClassManager } from "@/components/class-manager";
import { QRGenerator } from "@/components/qr-generator";
import { StudentManager } from "@/components/student-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

interface Class {
  id: string;
  name: string;
  teacher: string;
  createdAt: string;
}

export default function AdminPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

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

  const handleClassAdded = (newClass: Class) => {
    setClasses([...classes, newClass]);
  };

  const handleClassUpdated = (updatedClass: Class) => {
    setClasses((current) =>
      current.map((cls) => (cls.id === updatedClass.id ? updatedClass : cls))
    );
  };

  const handleClassDeleted = (classId: string) => {
    setClasses((current) => current.filter((cls) => cls.id !== classId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
            Admin Panel
          </h1>
          <div className="flex w-full sm:w-auto gap-2">
            <Link href="/dashboard" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                Open Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full sm:max-w-xl grid-cols-3">
            <TabsTrigger value="qr">Generate QR</TabsTrigger>
            <TabsTrigger value="classes">Manage Classes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="mt-6">
            <QRGenerator classes={classes} />
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <ClassManager
              classes={classes}
              onClassAdded={handleClassAdded}
              onClassUpdated={handleClassUpdated}
              onClassDeleted={handleClassDeleted}
            />
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <StudentManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
