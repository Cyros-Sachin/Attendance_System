type StudentSortKey = {
  rollNumber: string;
  name: string;
};

export function compareByEnrollmentNumberAsc(
  a: StudentSortKey,
  b: StudentSortKey
) {
  const enrollmentCompare = a.rollNumber.localeCompare(b.rollNumber, undefined, {
    numeric: true,
    sensitivity: "base",
  });

  if (enrollmentCompare !== 0) return enrollmentCompare;

  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export function sortStudentsByEnrollmentNumberAsc<T extends StudentSortKey>(
  students: T[]
) {
  return [...students].sort(compareByEnrollmentNumberAsc);
}
