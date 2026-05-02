"use client";

import { useEffect, useState } from "react";
import { Check, Download, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  parentEmail: string | null;
  remarks: string | null;
  createdAt: string;
}

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRollNumber, setEditRollNumber] = useState("");
  const [editParentEmail, setEditParentEmail] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to load students");
        return;
      }

      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !rollNumber.trim()) {
      toast.error("Name and roll number are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rollNumber,
          parentEmail,
          remarks,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to add student");
        return;
      }

      setStudents((current) => [...current, data]);
      setName("");
      setRollNumber("");
      setParentEmail("");
      setRemarks("");
      toast.success("Student added to approved list");
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadStudentsCsv = () => {
    window.location.href = "/api/students/export";
  };

  const startEditing = (student: Student) => {
    setEditingStudentId(student.id);
    setEditName(student.name);
    setEditRollNumber(student.rollNumber);
    setEditParentEmail(student.parentEmail ?? "");
    setEditRemarks(student.remarks ?? "");
  };

  const cancelEditing = () => {
    setEditingStudentId(null);
    setEditName("");
    setEditRollNumber("");
    setEditParentEmail("");
    setEditRemarks("");
  };

  const handleUpdate = async (studentId: string) => {
    if (!editName.trim() || !editRollNumber.trim()) {
      toast.error("Name and roll number are required");
      return;
    }

    setBusyStudentId(studentId);
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          rollNumber: editRollNumber,
          parentEmail: editParentEmail,
          remarks: editRemarks,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update student");
        return;
      }

      setStudents((current) =>
        current.map((student) => (student.id === studentId ? data : student))
      );
      cancelEditing();
      toast.success("Student updated");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    } finally {
      setBusyStudentId(null);
    }
  };

  const handleDelete = async (student: Student) => {
    const confirmed = window.confirm(
      `Delete ${student.name}? This will also delete this student's attendance records.`
    );
    if (!confirmed) return;

    setBusyStudentId(student.id);
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete student");
        return;
      }

      setStudents((current) => current.filter((item) => item.id !== student.id));
      if (editingStudentId === student.id) cancelEditing();
      toast.success("Student deleted");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    } finally {
      setBusyStudentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Students
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add approved students manually or download the generated attendance CSV.
            </p>
          </div>
          <Button onClick={handleDownloadStudentsCsv} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Student Name</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter student name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Roll Number</label>
            <Input
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
              placeholder="Enter roll number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Parent Email</label>
            <Input
              type="email"
              value={parentEmail}
              onChange={(event) => setParentEmail(event.target.value)}
              placeholder="parent@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Remarks</label>
            <Textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Optional remarks"
              className="min-h-10"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="w-full p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Approved Student List</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Parent Email</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No students added yet
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {editingStudentId === student.id ? (
                      <Input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="min-w-40"
                      />
                    ) : (
                      student.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStudentId === student.id ? (
                      <Input
                        value={editRollNumber}
                        onChange={(event) => setEditRollNumber(event.target.value)}
                        className="min-w-32"
                      />
                    ) : (
                      student.rollNumber
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStudentId === student.id ? (
                      <Input
                        type="email"
                        value={editParentEmail}
                        onChange={(event) => setEditParentEmail(event.target.value)}
                        className="min-w-48"
                      />
                    ) : (
                      student.parentEmail || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStudentId === student.id ? (
                      <Input
                        value={editRemarks}
                        onChange={(event) => setEditRemarks(event.target.value)}
                        className="min-w-48"
                      />
                    ) : (
                      student.remarks || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {editingStudentId === student.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(student.id)}
                            disabled={busyStudentId === student.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={busyStudentId === student.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(student)}
                            disabled={busyStudentId === student.id}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(student)}
                            disabled={busyStudentId === student.id}
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
      </Card>
    </div>
  );
}
