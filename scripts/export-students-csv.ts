import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildStudentsCsv } from "../lib/students-csv";
import prisma from "../lib/prisma-client";

async function main() {
  const requestedPath = process.argv[2];
  const outputPath =
    requestedPath ??
    path.join(
      process.cwd(),
      "exports",
      `students-${new Date().toISOString().split("T")[0]}.csv`
    );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, await buildStudentsCsv(), "utf8");
  console.log(`Students CSV exported to ${outputPath}`);
}

main()
  .catch((error) => {
    console.error("Failed to export students CSV:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
