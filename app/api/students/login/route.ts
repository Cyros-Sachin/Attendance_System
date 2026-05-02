import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const rollNumber = String(body.rollNumber ?? "").trim();

    if (!name || !rollNumber) {
      return NextResponse.json(
        { error: "Name and roll number are required" },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      where: { rollNumber },
      select: {
        id: true,
        name: true,
        rollNumber: true,
        parentEmail: true,
        remarks: true,
      },
    });

    const student = students.find((record) => normalize(record.name) === normalize(name));

    if (!student) {
      return NextResponse.json(
        { error: "Student not found in the approved student list" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      name: student.name,
      rollNumber: student.rollNumber,
      parentEmail: student.parentEmail,
      remarks: student.remarks,
    });
  } catch (error) {
    console.error("Error validating student login:", error);
    return NextResponse.json(
      { error: "Failed to validate student login" },
      { status: 500 }
    );
  }
}
