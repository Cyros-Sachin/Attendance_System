import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { sortStudentsByEnrollmentNumberAsc } from "@/lib/student-sort";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const studentSelect = {
  id: true,
  name: true,
  rollNumber: true,
  parentEmail: true,
  parentContactNumber: true,
  tgName: true,
  courseRegistrationStatus: true,
  tgCourseRegistrationStatus: true,
  feesDetails: true,
  remarks: true,
  createdAt: true,
};

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: { classId: null },
      select: studentSelect,
    });

    return NextResponse.json(sortStudentsByEnrollmentNumberAsc(students), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = normalize(String(body.name ?? ""));
    const rollNumber = normalize(String(body.rollNumber ?? ""));
    const parentEmail = normalize(String(body.parentEmail ?? ""));
    const parentContactNumber = normalize(String(body.parentContactNumber ?? ""));
    const tgName = normalize(String(body.tgName ?? ""));
    const legacyCourseRegistrationStatus = normalize(
      String(body.tgCourseRegistrationStatus ?? "")
    );
    const courseRegistrationStatus = normalize(
      String(body.courseRegistrationStatus ?? legacyCourseRegistrationStatus)
    );
    const feesDetails = normalize(String(body.feesDetails ?? ""));
    const remarks = normalize(String(body.remarks ?? ""));

    if (!name || !rollNumber) {
      return NextResponse.json(
        { error: "Name and enrollment number are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.student.findFirst({
      where: {
        rollNumber,
        classId: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A student with this enrollment number already exists" },
        { status: 409 }
      );
    }

    const student = await prisma.student.create({
      data: {
        name,
        rollNumber,
        parentEmail: parentEmail || null,
        parentContactNumber: parentContactNumber || null,
        tgName: tgName || null,
        courseRegistrationStatus: courseRegistrationStatus || null,
        tgCourseRegistrationStatus: courseRegistrationStatus || null,
        feesDetails: feesDetails || null,
        remarks: remarks || null,
      },
      select: studentSelect,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
