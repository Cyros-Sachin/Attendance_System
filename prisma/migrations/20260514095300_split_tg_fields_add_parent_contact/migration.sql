-- AlterTable
ALTER TABLE "students" ADD COLUMN "parentContactNumber" TEXT;
ALTER TABLE "students" ADD COLUMN "tgName" TEXT;
ALTER TABLE "students" ADD COLUMN "courseRegistrationStatus" TEXT;

-- Preserve legacy TG/course status data when available
UPDATE "students"
SET "courseRegistrationStatus" = "tgCourseRegistrationStatus"
WHERE "courseRegistrationStatus" IS NULL
  AND "tgCourseRegistrationStatus" IS NOT NULL;
