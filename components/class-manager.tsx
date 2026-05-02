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
import { Check, Pencil, Trash2, X } from "lucide-react";

interface Class {
  id: string;
  name: string;
  teacher: string;
  createdAt: string;
}

interface ClassManagerProps {
  classes: Class[];
  onClassAdded: (newClass: Class) => void;
  onClassUpdated: (updatedClass: Class) => void;
  onClassDeleted: (classId: string) => void;
}

export function ClassManager({
  classes,
  onClassAdded,
  onClassUpdated,
  onClassDeleted,
}: ClassManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editTeacherName, setEditTeacherName] = useState("");
  const [busyClassId, setBusyClassId] = useState<string | null>(null);

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

  const startEditing = (cls: Class) => {
    setEditingClassId(cls.id);
    setEditClassName(cls.name);
    setEditTeacherName(cls.teacher);
  };

  const cancelEditing = () => {
    setEditingClassId(null);
    setEditClassName("");
    setEditTeacherName("");
  };

  const handleUpdate = async (classId: string) => {
    if (!editClassName.trim() || !editTeacherName.trim()) {
      toast.error("Class name and teacher are required");
      return;
    }

    setBusyClassId(classId);
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editClassName,
          teacher: editTeacherName,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update class");
        return;
      }

      onClassUpdated(data);
      cancelEditing();
      toast.success("Class updated");
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Failed to update class");
    } finally {
      setBusyClassId(null);
    }
  };

  const handleDelete = async (cls: Class) => {
    const confirmed = window.confirm(
      `Delete ${cls.name}? This will also delete its attendance records and QR sessions.`
    );
    if (!confirmed) return;

    setBusyClassId(cls.id);
    try {
      const response = await fetch(`/api/classes/${cls.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete class");
        return;
      }

      onClassDeleted(cls.id);
      if (editingClassId === cls.id) cancelEditing();
      toast.success("Class deleted");
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    } finally {
      setBusyClassId(null);
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">
                    {editingClassId === cls.id ? (
                      <Input
                        value={editClassName}
                        onChange={(event) => setEditClassName(event.target.value)}
                        className="min-w-48"
                      />
                    ) : (
                      cls.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingClassId === cls.id ? (
                      <Input
                        value={editTeacherName}
                        onChange={(event) => setEditTeacherName(event.target.value)}
                        className="min-w-44"
                      />
                    ) : (
                      cls.teacher
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(cls.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {editingClassId === cls.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(cls.id)}
                            disabled={busyClassId === cls.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={busyClassId === cls.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(cls)}
                            disabled={busyClassId === cls.id}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cls)}
                            disabled={busyClassId === cls.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
