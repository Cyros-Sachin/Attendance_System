PRAGMA foreign_keys=OFF;

CREATE TABLE "new_students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "parentEmail" TEXT,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" TEXT,
    CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_students" ("id", "name", "rollNumber", "parentEmail", "remarks", "createdAt", "classId")
SELECT "id", "name", "rollNumber", "parentEmail", "remarks", "createdAt", "classId"
FROM "students";

DROP TABLE "students";
ALTER TABLE "new_students" RENAME TO "students";

CREATE UNIQUE INDEX "students_rollNumber_classId_key" ON "students"("rollNumber", "classId");

PRAGMA foreign_keys=ON;
