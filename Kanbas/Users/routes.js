import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";
export default function UserRoutes(app) {
  const createUser = (req, res) => { };
  const deleteUser = (req, res) => { };
  const findAllUsers = (req, res) => { };
  const findUserById = (req, res) => { };
  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const courses = courseDao.findCoursesForEnrolledUser(userId);
    res.json(courses);
  };
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);

  const createCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    const newCourse = courseDao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const updateUser = (req, res) => { 
    const userId = req.params.userId;
    const userUpdates = req.body;
    dao.updateUser(userId, userUpdates);
    const currentUser = dao.findUserById(userId);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);

  };
  const signup = (req, res) => { 
    const user = dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json(
        { message: "Username already in use" });
      return;
    }
    const currentUser = dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);

  };
 const signin = (req, res) => {
    try {
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);
      console.log('Content-Type:', req.headers['content-type']);
  
      const { username, password } = req.body;
      
      if (!username || !password) {
        console.log('Missing credentials:', { username: !!username, password: !!password });
        return res.status(400).json({ 
          message: "Username and password are required",
          received: { username: !!username, password: !!password }
        });
      }
  
      const currentUser = dao.findUserByCredentials(username, password);
      console.log('Found user:', currentUser ? 'Yes' : 'No');
      
      if (currentUser) {
        req.session["currentUser"] = currentUser;
        console.log('Session set:', req.session);
        return res.json(currentUser);
      } else {
        return res.status(401).json({ 
          message: "Invalid username or password",
          debug: { attemptedUsername: username }
        });
      }
    } catch (error) {
      console.error('Signin error:', error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };
  const signout = (req, res) => {
    
    req.session.destroy();
    res.sendStatus(200);
  };

  const profile = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }

    res.json(currentUser);
  };
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  app.post("/api/users/current/courses", createCourse);
}
