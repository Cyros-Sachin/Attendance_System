import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = normalize(String(body.name ?? ""));
    const teacher = normalize(String(body.teacher ?? ""));

    if (!name || !teacher) {
      return NextResponse.json(
        { error: "Class name and teacher are required" },
        { status: 400 }
      );
    }

    const duplicate = await prisma.class.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another class with this name already exists" },
        { status: 409 }
      );
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: { name, teacher },
    });

    return NextResponse.json(updatedClass, { status: 200 });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
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

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
