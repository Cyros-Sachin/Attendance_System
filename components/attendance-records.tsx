"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface AttendanceRecordsProps {
  records: AttendanceRecord[];
  classes: any[];
}

const ALL_CLASSES_VALUE = "__all_classes__";
const ALL_STATUS_VALUE = "__all_status__";

export function AttendanceRecords({
  records,
  classes,
}: AttendanceRecordsProps) {
  const [filterClass, setFilterClass] = useState<string>(ALL_CLASSES_VALUE);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>(ALL_STATUS_VALUE);
  const [searchStudent, setSearchStudent] = useState<string>("");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (filterClass !== ALL_CLASSES_VALUE && record.classId !== filterClass) {
        return false;
      }
      if (filterDate && record.date !== filterDate) return false;
      if (filterStatus !== ALL_STATUS_VALUE && record.status !== filterStatus) {
        return false;
      }
      if (
        searchStudent &&
        !record.studentName.toLowerCase().includes(searchStudent.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [records, filterClass, filterDate, filterStatus, searchStudent]);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records to export");
      return;
    }

    const csv = Papa.unparse(filteredRecords);
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Attendance exported as CSV");
  };

  const exportToJSON = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records to export");
      return;
    }

    const json = JSON.stringify(filteredRecords, null, 2);
    const link = document.createElement("a");
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
    link.download = `attendance-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success("Attendance exported as JSON");
  };

  const printRecords = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records to print");
      return;
    }

    const printWindow = window.open("", "", "height=600,width=900");
    if (!printWindow) {
      toast.error("Failed to open print window");
      return;
    }

    const html = `
      <html>
        <head>
          <title>Attendance Records</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .present { color: green; font-weight: bold; }
            .absent { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Attendance Records</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No.</th>
                <th>Class</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords
                .map(
                  (r) => `
                <tr>
                  <td>${r.studentName}</td>
                  <td>${r.studentId}</td>
                  <td>${r.className}</td>
                  <td>${r.date}</td>
                  <td>${r.time}</td>
                  <td class="${r.status}">${r.status.toUpperCase()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="w-full p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Attendance Records</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Search Student</label>
          <Input
            placeholder="Student name..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Class</label>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger>
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CLASSES_VALUE}>All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS_VALUE}>All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Button onClick={exportToCSV} variant="outline" className="flex-1">
          Download CSV
        </Button>
        <Button onClick={exportToJSON} variant="outline" className="flex-1">
          Download JSON
        </Button>
        <Button onClick={printRecords} variant="outline" className="flex-1">
          Print
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.studentName}
                  </TableCell>
                  <TableCell>{record.studentId}</TableCell>
                  <TableCell>{record.className}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.time}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        record.status === "present"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.status.toUpperCase()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredRecords.length} of {records.length} records
      </div>
    </Card>
  );
}
