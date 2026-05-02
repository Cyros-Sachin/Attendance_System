import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const studentSelect = {
  id: true,
  name: true,
  rollNumber: true,
  parentEmail: true,
  remarks: true,
  createdAt: true,
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const duplicate = await prisma.student.findFirst({
      where: {
        rollNumber,
        classId: null,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another student with this roll number already exists" },
        { status: 409 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        rollNumber,
        parentEmail: parentEmail || null,
        remarks: remarks || null,
      },
      select: studentSelect,
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
