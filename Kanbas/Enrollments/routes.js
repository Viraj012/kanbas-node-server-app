import * as enrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app) {
  app.get("/api/enrollments", (req, res) => {
    const enrollments = enrollmentsDao.getAllEnrollments();
    res.send(enrollments);
  });

  app.post("/api/enrollments/enroll/:courseId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    const { courseId } = req.params;
    const status = await enrollmentsDao.enrollUserInCourse(
      currentUser._id,
      courseId
    );
    res.send(status);
  });

  app.post("/api/enrollments/unenroll/:courseId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    const { courseId } = req.params;
    const status = await enrollmentsDao.unenrollUserFromCourse(
      currentUser._id,
      courseId
    );
    res.send(status);
  });
}