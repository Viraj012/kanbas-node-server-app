import Database from "../Database/index.js";

export function getAllEnrollments() {
  return Database.enrollments;
}

export function enrollUserInCourse(userId, courseId) {
  const { enrollments } = Database;
  enrollments.push({
    _id: Date.now().toString(),
    user: userId,
    course: courseId,
  });
}

export function unenrollUserFromCourse(userId, courseId) {
  const { enrollments } = Database;
  Database.enrollments = enrollments.filter(
    (e) => !(e.user === userId && e.course === courseId)
  );
}