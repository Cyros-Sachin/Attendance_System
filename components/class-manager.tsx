"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Class {
  id: string;
  name: string;
  teacher: string;
  createdAt: string;
}

interface ClassManagerProps {
  classes: Class[];
  onClassAdded: (newClass: Class) => void;
}

export function ClassManager({ classes, onClassAdded }: ClassManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!className.trim() || !teacherName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          teacher: teacherName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create class");
        setIsSubmitting(false);
        return;
      }

      onClassAdded(data);
      setClassName("");
      setTeacherName("");
      setShowForm(false);
      toast.success("Class created successfully!");
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Manage Classes</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
          className="w-full sm:w-auto"
        >
          {showForm ? "Cancel" : "Add New Class"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class Name</label>
              <Input
                type="text"
                placeholder="e.g., Mathematics 101"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Teacher Name</label>
              <Input
                type="text"
                placeholder="e.g., Dr. Smith"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating..." : "Create Class"}
          </Button>
        </form>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.teacher}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(cls.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
