"use client";

import { Card } from "@/components/ui/card";

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

interface ClassStats {
  className: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

interface AttendanceStatsProps {
  records: AttendanceRecord[];
}

export function AttendanceStats({ records }: AttendanceStatsProps) {
  // Calculate stats by class
  const statsByClass: Record<string, ClassStats> = {};

  records.forEach((record) => {
    if (!statsByClass[record.classId]) {
      statsByClass[record.classId] = {
        className: record.className,
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
      };
    }

    statsByClass[record.classId].total += 1;
    if (record.status === "present") {
      statsByClass[record.classId].present += 1;
    } else {
      statsByClass[record.classId].absent += 1;
    }
  });

  // Calculate percentages
  Object.keys(statsByClass).forEach((classId) => {
    const stats = statsByClass[classId];
    if (stats.total > 0) {
      stats.percentage = Math.round((stats.present / stats.total) * 100);
    }
  });

  const classStatsArray = Object.values(statsByClass).sort(
    (a, b) => b.percentage - a.percentage
  );

  // Overall stats
  const totalRecords = records.length;
  const totalPresent = records.filter((r) => r.status === "present").length;
  const overallPercentage =
    totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-sm text-gray-600 font-medium">Total Records</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
            {totalRecords}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-sm text-gray-600 font-medium">Present</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
            {totalPresent}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-sm text-gray-600 font-medium">Absent</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">
            {totalRecords - totalPresent}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-sm text-gray-600 font-medium">Overall %</div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">
            {overallPercentage}%
          </div>
        </Card>
      </div>

      {/* Per-Class Stats */}
      {classStatsArray.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4">Class-wise Statistics</h3>
          <div className="space-y-4">
            {classStatsArray.map((stats) => (
              <div key={stats.className} className="border-b pb-4 last:border-b-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {stats.className}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {stats.present}/{stats.total} present
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats.percentage}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
