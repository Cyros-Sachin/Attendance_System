import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import prisma from "../lib/prisma-client";

type StudentCsvRow = Record<string, string | undefined>;

function clean(value: string | undefined) {
  return String(value ?? "").trim();
}

async function main() {
  const csvPath = process.argv[2] ?? path.join(process.cwd(), "prisma", "students.csv");
  const csv = await readFile(csvPath, "utf8");
  const parsed = Papa.parse<StudentCsvRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map((error) => error.message).join("; "));
  }

  let imported = 0;

  for (const row of parsed.data) {
    const name = clean(row.student_name ?? row.name);
    const rollNumber = clean(row.roll_number ?? row.student_id ?? row.roll);
    const parentEmail = clean(row.parent_email);
    const remarks = clean(row.remarks);

    if (!name || !rollNumber) continue;

    const existingStudent = await prisma.student.findFirst({
      where: {
        rollNumber,
        name,
        classId: null,
      },
    });

    if (existingStudent) {
      await prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          name,
          parentEmail: parentEmail || null,
          remarks: remarks || null,
        },
      });
    } else {
      await prisma.student.create({
        data: {
          name,
          rollNumber,
          parentEmail: parentEmail || null,
          remarks: remarks || null,
        },
      });
    }

    imported += 1;
  }

  console.log(`Imported or updated ${imported} approved students from ${csvPath}`);
}

main()
  .catch((error) => {
    console.error("Failed to import students CSV:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
