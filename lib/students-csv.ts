import prisma from "./prisma-client";
import { sortStudentsByEnrollmentNumberAsc } from "./student-sort";

type CsvStudent = {
  rollNumber: string;
  name: string;
  parentEmail: string;
  parentContactNumber: string;
  tgName: string;
  courseRegistrationStatus: string;
  feesDetails: string;
  remarks: string;
  classPercentages: Map<string, string>;
};

function escapeCsvValue(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function slugHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function buildStudentsCsv() {
  const [classes, students, attendance] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany(),
    prisma.attendance.findMany({
      select: {
        classId: true,
        studentId: true,
        date: true,
        status: true,
      },
    }),
  ]);

  const totalSessionsByClass = new Map<string, number>();
  for (const cls of classes) {
    const sessionDates = new Set(
      attendance
        .filter((record) => record.classId === cls.id)
        .map((record) => record.date)
    );
    totalSessionsByClass.set(cls.id, sessionDates.size);
  }

  const presentByStudentClass = new Map<string, number>();
  for (const record of attendance) {
    if (record.status !== "present" && record.status !== "late") continue;
    const key = `${record.studentId}:${record.classId}`;
    presentByStudentClass.set(key, (presentByStudentClass.get(key) ?? 0) + 1);
  }

  const rows = new Map<string, CsvStudent>();
  const sortedStudents = sortStudentsByEnrollmentNumberAsc(students);

  for (const student of sortedStudents) {
    const key = `${student.rollNumber.toLowerCase()}:${student.name.toLowerCase()}`;
    const row =
      rows.get(key) ??
      {
        rollNumber: student.rollNumber,
        name: student.name,
        parentEmail: student.parentEmail ?? "",
        parentContactNumber: student.parentContactNumber ?? "",
        tgName: student.tgName ?? "",
        courseRegistrationStatus:
          student.courseRegistrationStatus ?? student.tgCourseRegistrationStatus ?? "",
        feesDetails: student.feesDetails ?? "",
        remarks: student.remarks ?? "",
        classPercentages: new Map<string, string>(),
      };

    if (!row.parentEmail && student.parentEmail) row.parentEmail = student.parentEmail;
    if (!row.parentContactNumber && student.parentContactNumber) {
      row.parentContactNumber = student.parentContactNumber;
    }
    if (!row.tgName && student.tgName) {
      row.tgName = student.tgName;
    }
    if (!row.courseRegistrationStatus) {
      row.courseRegistrationStatus =
        student.courseRegistrationStatus ?? student.tgCourseRegistrationStatus ?? "";
    }
    if (!row.feesDetails && student.feesDetails) {
      row.feesDetails = student.feesDetails;
    }
    if (!row.remarks && student.remarks) row.remarks = student.remarks;

    for (const cls of classes) {
      const totalSessions = totalSessionsByClass.get(cls.id) ?? 0;
      const present = presentByStudentClass.get(`${student.id}:${cls.id}`) ?? 0;
      const percentage =
        totalSessions > 0 ? Math.round((present / totalSessions) * 10000) / 100 : 0;

      row.classPercentages.set(cls.id, String(percentage));
    }

    rows.set(key, row);
  }

  const headers = [
    "student_name",
    "roll_number",
    "parent_email",
    "parent_contact_number",
    "tg_name",
    "course_registration_status",
    "fees_details",
    ...classes.map((cls) => `attendance_percentage_${slugHeader(cls.name)}`),
    "remarks",
  ];

  const csvRows = sortStudentsByEnrollmentNumberAsc([...rows.values()]).map((student) => [
    student.name,
    student.rollNumber,
    student.parentEmail,
    student.parentContactNumber,
    student.tgName,
    student.courseRegistrationStatus,
    student.feesDetails,
    ...classes.map((cls) => student.classPercentages.get(cls.id) ?? ""),
    student.remarks,
  ]);

  return [headers, ...csvRows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}
