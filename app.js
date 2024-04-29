const express = require("express");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const db = require("./db/connect");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3001", "https://gc-hackathon-2024.web.app"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./Frontend/build")));

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN_DAYS = process.env.JWT_EXPIRES_IN_DAYS;
const NODE_ENV = process.env.NODE_ENV;

const uploadsDir = "./uploads";
fs.existsSync(uploadsDir) || fs.mkdirSync(uploadsDir, { recursive: true });

app.use((req, res, next) => {
  console.log(req.method, req.path);
  console.log("body", "-----------------------------");
  console.log(req.body);
  console.log("---------------------------------------");

  next();
});

app.post("/api/signup", async (req, res) => {
  const { username, password, role } = req.body;
  console.log(req.body);

  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("username", "==", username).get();
  if (!snapshot.empty) {
    return res.status(400).send("User already exists.");
  }

  const newUserRef = usersRef.doc();
  await newUserRef.set({ username, password, role });

  const token = jwt.sign({ uid: newUserRef.id }, JWT_SECRET, {
    expiresIn: "24h",
  });

  await newUserRef.update({ token });

  console.log("HERE");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    secure: NODE_ENV === "production",
  });
  res
    .status(201)
    .send({ username, role, message: "User created successfully." });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("username", "==", username).get();
  if (snapshot.empty) {
    return res.status(400).send("User not found.");
  }

  const user = snapshot.docs[0].data();
  if (user.password !== password) {
    return res.status(400).send("Invalid password.");
  }

  const token = jwt.sign({ uid: snapshot.docs[0].id }, JWT_SECRET, {
    expiresIn: "24h",
  });

  await snapshot.docs[0].ref.update({ token });

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    secure: NODE_ENV === "production",
  });

  res
    .status(200)
    .send({ username, role: user.role, message: "Login successful." });
});

app.use("/api", async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log({ token });

    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const uid = decoded.uid;

    const userRef = db.collection("users").doc(uid);
    const user = await userRef.get();
    if (!user.exists) {
      return res.status(404).send("User not found.");
    }

    req.user = { ...user.data(), id: user.id };

    next();
  } catch (error) {
    console.error("Error fetching user:", error);

    res.status(500).send("Error fetching user");
  }
});

app.get("/api/getUser", async (req, res) => {
  try {
    res.status(200).send({
      ...req.user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
});

app.patch("/api/updateUser", async (req, res) => {
  const { name, email, phone, zNumber } = req.body;
  const userRef = db.collection("users").doc(req.user.id);

  const doc = await userRef.set(
    { name, email, phone, zNumber },
    { merge: true }
  );

  console.log({ doc });

  res.send(doc);
});

app.post("/api/logout", async (req, res) => {
  const { token } = req.cookies;
  const decoded = jwt.verify(token, JWT_SECRET);
  const uid = decoded.uid;

  const userRef = db.collection("users").doc(uid);
  await userRef.update({ token: "" });

  res.clearCookie("token");
  res.status(200).send("Logout successful.");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Use the uploadsDir variable
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post(
  "/api/submitApplication",
  upload.single("resume"),
  async (req, res) => {
    try {
      const {
        username,
        name,
        email,
        phoneNumber,
        zNumber,
        joiningDate,
        previousCourses,
        eligibleCourses,
        description,
      } = req.body;

      console.log(req.body);

      const resume = req.file ? req.file.path : null;

      const previousCoursesArray = JSON.parse(previousCourses);
      const eligibleCoursesArray = JSON.parse(eligibleCourses);

      const pendingArray = [];
      for (let i = 0; i < eligibleCoursesArray.length; i++) {
        pendingArray.push("Pending");
      }

      const docRef = db.collection("applicants").doc();
      await docRef.set({
        username,
        name,
        email,
        phoneNumber,
        zNumber,
        joiningDate,
        description,
        eligibleCourses: eligibleCoursesArray,
        previousTACourses: previousCoursesArray,
        DSCourses: [],
        resume,
        status: pendingArray,
      });

      res.status(200).send({
        message: "Application submitted successfully",
        docId: docRef.id,
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

// Route for getting all the applications
app.get("/api/getApplicants", async (req, res) => {
  try {
    const { user } = req.query;
    let applicantsSnapshot;
    if (user) {
      applicantsSnapshot = await db
        .collection("applicants")
        .where("username", "==", user)
        .get();
    } else {
      applicantsSnapshot = await db.collection("applicants").get();
    }
    const applicants = [];
    applicantsSnapshot.forEach((doc) => {
      applicants.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).send("Error fetching applicants");
  }
});

app.put("/api/updateApplicant/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const applicantRef = db.collection("applicants").doc(id);
    await applicantRef.update(updatedData);
    res.status(200).send({ message: "Application updated successfully" });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).send({ message: "Failed to update application", error });
  }
});

// Route to update the status of an application
app.post("/api/updateStatus", async (req, res) => {
  try {
    const { applicantId, index, newStatus } = req.body;
    const applicationsRef = db.collection("applicants");
    const applicationSnapshot = await applicationsRef.doc(applicantId).get();

    if (!applicationSnapshot.exists) {
      return res.status(404).json({ error: "Application not found" });
    }

    const applicationData = applicationSnapshot.data();
    applicationData.status[index] = newStatus;

    await applicationsRef.doc(applicantId).set(applicationData);

    const newNotification = {
      username: null,
      role: "Instructor",
      message: `${applicationData.name} has been accepted for TAship for ${applicationData.eligibleCourses[index]}.`,
    };

    await db.collection("notifications").add(newNotification);

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Route to get applications with "Accepted" status
app.get("/api/getAcceptedApplications", async (req, res) => {
  try {
    const applicationsSnapshot = await db
      .collection("applicants")
      .where("status", "array-contains", "Accepted")
      .get();

    const acceptedApplications = [];
    applicationsSnapshot.forEach((doc) => {
      acceptedApplications.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(acceptedApplications);
  } catch (error) {
    console.error("Error fetching accepted applications:", error);
    res.status(500).json({ error: "Error fetching accepted applications" });
  }
});

// Route to add new course in the database
app.post("/api/add-course", async (req, res) => {
  try {
    const { courseName, courseCode, capacity } = req.body;

    const courseRef = await db.collection("courses").add({
      courseName,
      courseCode,
      capacity,
      active: true,
    });

    res
      .status(201)
      .json({ message: "Course added successfully", id: courseRef.id });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: "Failed to add the course" });
  }
});

app.post("/api/deactivateCourse/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const courseRef = db.collection("courses").doc(id);

    await courseRef.set({ active: false }, { merge: true });

    res.send("Deactivation successful");
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: "Failed to deactivate the course" });
  }
});

app.post("/api/activateCourse/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const courseRef = db.collection("courses").doc(id);

    await courseRef.set({ active: true }, { merge: true });

    res.send("Deactivation successful");
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: "Failed to deactivate the course" });
  }
});

// Route to get all the available courses
app.get("/api/get-all-courses", async (req, res) => {
  try {
    const coursesSnapshot = await db
      .collection("courses")
      .where("active", "==", true)
      .get();
    const courses = [];

    coursesSnapshot.forEach((doc) => {
      const courseData = doc.data();
      courses.push({ ...courseData, id: doc.id });
    });

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Route to get all the available and unavailable courses
app.get("/api/courses", async (req, res) => {
  try {
    const coursesSnapshot = await db.collection("courses").get();
    const courses = [];

    coursesSnapshot.forEach((doc) => {
      const courseData = doc.data();
      courses.push({ ...courseData, id: doc.id });
    });

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Route to create feedback
app.post("/api/createFeedback", async (req, res) => {
  try {
    const { username, name, email, course, feedback, rating } = req.body;

    const feedbackRef = await db.collection("Feedbacks").add({
      username,
      name,
      email,
      course,
      feedback,
      rating,
    });

    const newNotification = {
      username,
      role: "Student",
      message: `You have got a feedback for ${course.courseName} (${course.courseCode})`,
    };
    await db.collection("notifications").add(newNotification);

    res
      .status(201)
      .json({ message: "Feedback created successfully", id: feedbackRef.id });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ error: "Failed to create feedback" });
  }
});

// Route to get all feedbacks
app.get("/api/getAllFeedbacks", async (req, res) => {
  try {
    const feedbacksSnapshot = await db.collection("Feedbacks").get();

    const feedbacks = [];
    feedbacksSnapshot.forEach((doc) => {
      feedbacks.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});

// Get feedbacks for a particular username
app.get("/api/getFeedbacks/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const feedbacksSnapshot = await db
      .collection("Feedbacks")
      .where("username", "==", username)
      .get();

    const feedbacks = [];
    feedbacksSnapshot.forEach((doc) => {
      feedbacks.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});

// Add new notification
app.post("/api/notifications", async (req, res) => {
  try {
    const newNotification = req.body;
    const addedNotification = await db
      .collection("notifications")
      .add(newNotification);
    res.status(201).json({ id: addedNotification.id, ...newNotification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get notifications for a specific username
app.get("/api/notifications/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const notificationsSnapshot = await db
      .collection("notifications")
      .where("username", "==", username)
      .get();

    if (notificationsSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No notifications found for this user." });
    }

    const notifications = notificationsSnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get notifications for a specific role
app.get("/api/notifications/:role", async (req, res) => {
  try {
    const role = req.params.role;
    const notificationsSnapshot = await db
      .collection("notifications")
      .where("role", "==", role)
      .get();

    if (notificationsSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No notifications found for this user." });
    }

    const notifications = notificationsSnapshot.docs.map((doc) => doc.data());
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to delete a notification
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection("notifications").doc(id).delete();
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to download resume file
app.get("/api/download-resume/:filename", (req, res) => {
  const filename = req.params.filename;
  const fileDirectory = path.join(__dirname, "uploads");
  const filePath = path.join(fileDirectory, filename);

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Disposition", "attachment; filename=" + filename);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else {
    res.status(404).send("File not found");
  }
});

// Route for the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./Frontend/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully");
  app.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully");
  app.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGUSR2", () => {
  console.log("Received SIGUSR2 (nodemon restart)");
  app.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
