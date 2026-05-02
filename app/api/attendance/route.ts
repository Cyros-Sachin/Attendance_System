import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      studentName,
      classId,
      className,
      teacher,
      sessionType,
      date,
      time,
      status = "present",
    } = body;

    if (!studentId || !classId || !date) {
      return NextResponse.json(
        { error: "Student ID, class ID, and date are required" },
        { status: 400 }
      );
    }

    // Student must already exist in the approved list for this class.
    const student = await prisma.student.findFirst({
      where: {
        AND: [
          { rollNumber: studentId },
          { name: { equals: studentName } },
        ],
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student is not approved for this class" },
        { status: 403 }
      );
    }

    // Check for duplicate attendance (same student, same class, same date)
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_classId_date: {
          studentId: student.id,
          classId,
          date,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Attendance already recorded for this date" },
        { status: 409 }
      );
    }

    const timestamp = new Date();
    const attendanceRecord = await prisma.attendance.create({
      data: {
        studentId: student.id,
        classId,
        date,
        time: time || timestamp.toTimeString().split(" ")[0],
        timestamp,
        sessionType: sessionType || "session",
        status,
      },
      include: {
        student: true,
        class: true,
      },
    });

    // Return all 11 fields required for n8n workflow
    const responseData = {
      id: attendanceRecord.id,
      studentId: attendanceRecord.student.rollNumber,
      studentName: attendanceRecord.student.name,
      classId: attendanceRecord.classId,
      className: attendanceRecord.class.name,
      teacher: attendanceRecord.class.teacher,
      session: attendanceRecord.sessionType,
      date: attendanceRecord.date,
      time: attendanceRecord.time,
      timestamp: attendanceRecord.timestamp.toISOString(),
      status: attendanceRecord.status,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get("classId");
    const date = request.nextUrl.searchParams.get("date");
    const studentId = request.nextUrl.searchParams.get("studentId");
    const format = request.nextUrl.searchParams.get("format"); // "csv" or "json"

    const query: {
      classId?: string;
      date?: string;
      student?: { rollNumber: string };
    } = {};

    if (classId) query.classId = classId;
    if (date) query.date = date;
    if (studentId) query.student = { rollNumber: studentId };

    const records = await prisma.attendance.findMany({
      where: query,
      include: {
        student: true,
        class: true,
      },
      orderBy: { timestamp: "desc" },
    });

    // Convert to 11-field format for n8n
    const formattedRecords = records.map((record) => ({
      id: record.id,
      studentId: record.student.rollNumber,
      studentName: record.student.name,
      classId: record.classId,
      className: record.class.name,
      teacher: record.class.teacher,
      session: record.sessionType,
      date: record.date,
      time: record.time,
      timestamp: record.timestamp.toISOString(),
      status: record.status,
    }));

    if (format === "csv") {
      // Convert to CSV format
      const headers = [
        "id",
        "studentId",
        "studentName",
        "classId",
        "className",
        "teacher",
        "session",
        "date",
        "time",
        "timestamp",
        "status",
      ];

      let csv = headers.join(",") + "\n";
      csv += formattedRecords
        .map(
          (record) =>
            `"${record.id}","${record.studentId}","${record.studentName}","${record.classId}","${record.className}","${record.teacher}","${record.session}","${record.date}","${record.time}","${record.timestamp}","${record.status}"`
        )
        .join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Default to JSON
    return NextResponse.json(formattedRecords, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
