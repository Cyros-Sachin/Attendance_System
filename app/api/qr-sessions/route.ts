import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, sessionType, expiryMinutes } = body;

    if (!classId || !sessionType) {
      return NextResponse.json(
        { error: "Class ID and session type are required" },
        { status: 400 }
      );
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    const expiresAt = new Date(Date.now() + (expiryMinutes || 10) * 60 * 1000);

    const qrSession = await prisma.qRSession.create({
      data: {
        classId,
        sessionType,
        expiresAt,
      },
      include: {
        class: true,
      },
    });

    // Use a compact string payload to reduce QR density and improve scan speed.
    const qrPayload = `v1|${qrSession.classId}|${qrSession.sessionType}|${qrSession.expiresAt.getTime()}`;

    return NextResponse.json(
      {
        session: qrSession,
        qrPayload,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating QR session:", error);
    return NextResponse.json(
      { error: "Failed to create QR session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get("classId");

    let query: any = {};
    if (classId) {
      query.where = { classId };
    }

    const sessions = await prisma.qRSession.findMany({
      ...query,
      include: { class: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Error fetching QR sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR sessions" },
      { status: 500 }
    );
  }
}
