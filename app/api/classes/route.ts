import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, teacher } = body;

    if (!name || !teacher) {
      return NextResponse.json(
        { error: "Name and teacher are required" },
        { status: 400 }
      );
    }

    // Check if class already exists
    const existing = await prisma.class.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Class already exists" },
        { status: 409 }
      );
    }

    const newClass = await prisma.class.create({
      data: { name, teacher },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
