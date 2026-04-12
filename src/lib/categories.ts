export const ASSIGNMENT_CATEGORIES = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Business & Management",
  "Economics",
  "Accounting",
  "Law",
  "Medicine & Health",
  "English & Literature",
  "History",
  "Psychology",
  "Education",
  "Arts & Design",
  "Other",
] as const;

export type AssignmentCategory = typeof ASSIGNMENT_CATEGORIES[number];
