import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: { classId: null },
      orderBy: [{ rollNumber: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        rollNumber: true,
        parentEmail: true,
        remarks: true,
        createdAt: true,
      },
    });

    return NextResponse.json(students, { status: 200 });
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
    const remarks = normalize(String(body.remarks ?? ""));

    if (!name || !rollNumber) {
      return NextResponse.json(
        { error: "Name and roll number are required" },
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
        { error: "A student with this roll number already exists" },
        { status: 409 }
      );
    }

    const student = await prisma.student.create({
      data: {
        name,
        rollNumber,
        parentEmail: parentEmail || null,
        remarks: remarks || null,
      },
      select: {
        id: true,
        name: true,
        rollNumber: true,
        parentEmail: true,
        remarks: true,
        createdAt: true,
      },
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
