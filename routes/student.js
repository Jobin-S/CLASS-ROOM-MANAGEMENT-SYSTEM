var express = require("express");
var router = express.Router();
var studentHelpers = require("../helpers/student-helpers");
var path = require("path");
var multer = require("multer");

const app = require("../app");
var http = require("http").Server(app);
var io = require("socket.io")(http);

io.on("connection", (socket) => {
  console.log("auth value: " + socket.id);
  socket.on("message", (details) => {
    socket.broadCast.emit("message", details);
  });
});

const submitAssignmentStorage = multer.diskStorage({
  destination: `${__dirname}/../public/pdf/students/assignments/`,
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}${path.extname(file.originalname)}`;
    req.session.studentAssignmentSubmitted = fileName;
    cb(null, fileName);
  },
});

const submitAssignment = multer({ storage: submitAssignmentStorage });

const verifyLogin = (req, res, next) => {
  req.session.studentPreviousPath = false;
  if (req.session.studentLoggedIn) {
    req.session.studentPreviousPath = req.path;
    next();
  } else {
    req.session.studentRedirectTo = req.path;
    res.redirect("/login");
  }
};

router.get("/", (req, res) => {
  res.render("student/role-selection", {title:'E CLASSROOM'});
});

router.get("/dashboard", verifyLogin, async (req, res) => {
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  req.session.student.attendance = currentAttendance.attendance;
  req.session.student.currentDate = currentAttendance.date;
  let announcements = await studentHelpers.getAnnouncements();
  let events = await studentHelpers.getEvents();
  let notifications = await studentHelpers.getNotification();
  let pendingAssigment = await studentHelpers.getPendingAssignment(
    req.session.student._id
  );
  let pendingNotes = await studentHelpers.getPendingNotes(
    req.session.student._id
  );
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/dashboard", {
    title: "students dashboard",
    student: req.session.student,
    announcements,
    events,
    notifications,
    pendingAssigment,
    pendingNotes,
    profilePic,
  });
});

router.get("/activate", function (req, res, next) {
  res.render("student/student-activate");
});

router.post("/send-otp", (req, res) => {
  req.session.studentNum = req.body.phone;

  studentHelpers
    .sendOtp(req.body.phone)
    .then((otp_id) => {
      req.session.otpId = otp_id;
      console.log(otp_id);
      res.json({ status: true });
    })
    .catch(() => {
      res.json({ status: false });
    });
});

router.post("/verify-otp", (req, res) => {
  studentHelpers.verifyOtp(req.body.otp, req.session.otpId).then((response) => {
    if (response.status == "success") {
      req.session.otpVerified = true;
    }
    res.json(response);
  });
});

router.get("/register", (req, res) => {
  res.render("student/register");
});

router.post("/register", (req, res) => {
  studentHelpers
    .register(req.session.studentNum, req.body.password)
    .then(async () => {
      req.session.otpVerified = false;
      studentHelpers.getStudent(req.session.studentNum).then((student) => {
        req.session.student = student;
        req.session.studentLoggedIn = true;
        res.redirect("/dashboard");
      });
    });
});

router.get("/login", (req, res) => {
  if (req.session.studentLoggedIn) {
    if (req.session.studentPreviousPath) {
      location = req.session.studentPreviousPath;
      console.log("previous path");
    } else {
      location = req.session.studentRedirectTo
        ? req.session.studentRedirectTo
        : "/dashboard";
    }
    res.redirect(location);
  } else {
    res.render("student/login", { loginError: req.session.loginError });
    req.session.loginError = false;
  }
});

router.post("/login", (req, res) => {
  studentHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.student = response.user;
      req.session.studentLoggedIn = true;

      res.redirect("/dashboard");
    } else {
      req.session.loginError = response.message;
      res.redirect("/login");
    }
  });
});

router.get("/attendance", verifyLogin, async (req, res) => {
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  let attendanceData = await studentHelpers.getAttendanceDetails(
    req.session.student._id
  );
  req.session.student.attendance = currentAttendance.attendance;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/attendance", {
    title: "Attendance",
    student: req.session.student,
    attendanceData,
    profilePic,
  });
});

router.get("/logout", (req, res) => {
  req.session.studentLoggedIn = false;
  req.session.student = null;
  res.redirect("/login");
});

router.get("/task", verifyLogin, async (req, res) => {
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  req.session.student.attendance = currentAttendance.attendance;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/task", {
    student: req.session.student,
    title: "Today's Task",
    profilePic,
  });
});

router.get("/profile", verifyLogin, async (req, res) => {
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  req.session.student.attendance = currentAttendance.attendance;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/profile", {
    student: req.session.student,
    title: "profile",
    profilePic,
  });
});

router.get("/assignments", verifyLogin, async (req, res) => {
  let assignments = await studentHelpers.getAllAssignments(
    req.session.student._id
  );
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  req.session.student.attendance = currentAttendance.attendance;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/assignments", {
    title: "assignments",
    assignments: assignments,
    student: req.session.student,
    profilePic,
  });
});

router.get("/notes", verifyLogin, async (req, res) => {
  let notes = await studentHelpers.getAllNotes(req.session.student.phone);
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  req.session.student.attendance = currentAttendance.attendance;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/notes", {
    title: "Notes",
    student: req.session.student,
    notes,
    profilePic,
  });
});

router.get("/assignment/:id", verifyLogin, async (req, res) => {
  let assignment = await studentHelpers.getSingleAssignment(req.params.id);
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  console.log(currentAttendance);
  req.session.student.attendance = currentAttendance.attendance ? true : false;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/single-assignment", {
    title: "assignment",
    student: req.session.student,
    assignment: assignment,
    profilePic,
  });
});

router.post(
  "/assignment/submit/:id",
  submitAssignment.single("pdf"),
  (req, res) => {
    let filename = req.session.studentAssignmentSubmitted;
    studentHelpers
      .submitAssignments(
        req.body,
        req.session.student.phone,
        filename,
        req.params.id
      )
      .then(() => {
        req.session.studentAssignmentSubmitted = null;
        res.redirect("/assignments");
      });
  }
);

router.get("/otp-login", (req, res) => {
  if (req.session.studentLoggedIn) {
    res.redirect("/dashboard");
  } else {
    res.render("student/otp-login", {
      title: "otp Login",
    });
  }
});

router.post("/otp-login", (req, res) => {
  studentHelpers.verifyOtp(req.body.otp, req.session.otpId).then((response) => {
    if (response.status == "success") {
      req.session.otpVerified = true;
      studentHelpers
        .otpLogin(req.session.otpVerified, req.session.studentNum)
        .then((student) => {
          req.session.student = student;
          req.session.studentLoggedIn = true;
          res.json({ status: "success" });
        });
    }
  });
});

router.get("/note/:id", verifyLogin, async (req, res) => {
  let note = await studentHelpers.getOneNote(req.params.id);
  let currentAttendance = await studentHelpers.verifyAttendance(
    req.session.student._id
  );
  req.session.student.attendance = currentAttendance.attendance;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/single-note", {
    title: note.topic,
    note,
    student: req.session.student,
    profilePic,
  });
});

router.post("/mark-attendance/:id", (req, res) => {
  studentHelpers
    .markAttendance(req.session.student._id, req.params.id)
    .then(() => {
      res.json({ status: true });
    })
    .catch(() => {
      console.log("rejected");
      res.json({ status: false });
    });
});

router.get("/announcement/:id", verifyLogin, async (req, res) => {
  let announcement = await studentHelpers.getSingleAnnouncement(req.params.id);
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  console.log(announcement);
  res.render("student/single-announcement", {
    student: req.session.student,
    title: announcement.title,
    announcement,
    profilePic,
  });
});

router.get("/event/:id", verifyLogin, async (req, res) => {
  let event = await studentHelpers.getSingleEvent(req.params.id);
  let isPurchased = await studentHelpers.VerifyEventPurchase(
    req.session.student._id,
    req.params.id
  );
  console.log("event purcased: " + isPurchased);
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  console.log(event);
  res.render("student/single-event", {
    student: req.session.student,
    title: event.title,
    event,
    isPurchased,
    profilePic,
  });
});

router.get("/purchased-event", verifyLogin, async (req, res) => {
  if (req.session.student.lastPurchasedTicket === null)
    res.redirect("/dashboard");
  let ticket = req.session.student.lastPurchasedTicket;
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  console.log(ticket);
  res.render("student/confirm-order", {
    student: req.session.student,
    title: "Payment Success",
    ticket,
    profilePic,
  });
  req.session.student.lastPurchasedTicket = null;
});

router.get("/gallery", verifyLogin, async (req, res) => {
  let galleryItems = await studentHelpers.getAllGalleryItems();
  let profilePic = await studentHelpers.getStudentProfilePic(
    req.session.student._id
  );

  res.render("student/gallery", {
    student: req.session.student,
    profilePic,
    title: "Gallery",
    galleryItems,
  });
});

module.exports = router;
