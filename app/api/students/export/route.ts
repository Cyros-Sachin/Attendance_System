import { NextResponse } from "next/server";
import { buildStudentsCsv } from "@/lib/students-csv";

export async function GET() {
  try {
    const csv = await buildStudentsCsv();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="students-${new Date()
          .toISOString()
          .split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting students:", error);
    return NextResponse.json(
      { error: "Failed to export students" },
      { status: 500 }
    );
  }
}
