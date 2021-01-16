const bcrypt = require("bcrypt");
const { response } = require("../app");
const db = require("../config/database");
const collection = require("../config/collection");
const { Logger, ObjectID } = require("mongodb");
const objectId = require("mongodb").ObjectID;

module.exports = {
  doLogin: (details) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      var user = await db
        .get()
        .collection(collection.TUTOR_COLLECTION)
        .findOne({ email: details.username });

      console.log(user);
      if (user == null) {
        console.log("login failed");
        resolve({ status: false, message: "username not found" });
      } else {
        if (details.password == "password") {
          console.log("login succesfull");
          response.user = user;
          response.status = true;
          resolve(response);
        } else {
          console.log("failed");
          resolve({ status: false, message: "password Incorrect" });
        }
      }
    });
  },
  getTutorProfile: (username) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .findOne({ email: username })
        .then((tutor) => {
          resolve(tutor);
        });
    });
  },
  getTutorName: (username) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .findOne({ email: username })
        .then((tutor) => {
          resolve(tutor.name);
        });
    });
  },
  updateProfile: (details, username) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .updateOne(
          { email: username },
          {
            $set: {
              name: details.name,
              gender: details.gender,
              dob: details.dob,
              email: details.email,
              phone: details.phone,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getProfilePic: (username) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .findOne({ email: username })
        .then((tutor) => {
          let image = !tutor.image ? "defaultProfilePic.jpg" : tutor.image;
          resolve(image);
        });
    });
  },
  updateProfilePic: (username, image) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .updateOne(
          { email: username },
          {
            $set: {
              image: image,
            },
          }
        )
        .then(() => {
          console.log("profile picture updated");
          resolve();
        });
    });
  },
  getNewAdmissionNo: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CLASS_INFO_COLLECTION)
        .findOne()
        .then((info) => {
          resolve(info.lastAdmissionNum + 1);
        });
    });
  },
  studentRegister: (details) => {
    console.log(details);
    return new Promise((resolve, reject) => {
      details.assignments = [];
      details.notes = [];
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .insertOne(details)
        .then(() => {
          resolve();
        });
    });
  },
  getAllStudents: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .find({})
        .toArray()
        .then((students) => {
          console.log(students);
          resolve(students);
        });
    });
  },
  increaseAdmissionNum: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CLASS_INFO_COLLECTION)
        .updateOne(
          { _id: objectId("5fc9b867640f9416cb653859") },
          {
            $inc: { lastAdmissionNum: 1 },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  deleteStudent: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .deleteOne({ _id: objectId(id) })
        .then(() => {
          resolve();
        });
    });
  },
  getOneStudent: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((student) => {
          resolve(student);
        });
    });
  },
  editStudent: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .updateOne(
          { _id: objectId(details._id) },
          {
            $set: {
              fname: details.fname,
              lname: details.lname,
              gender: details.gender,
              dob: details.dob,
              phone: details.phone,
              email: details.email,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  addAssignments: (details, fileName) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .insertOne({
          topic: details.topic,
          dateTime: Date(Date.now()),
          file: fileName,
        })
        .then(() => {
          resolve();
        });
    });
  },
  getAssignments: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .find()
        .toArray()
        .then((assignments) => {
          for (var i in assignments) {
            let dt = assignments[i].dateTime.trim().split(" ");
            assignments[i].date = `${dt[1]} ${dt[2]} ${dt[3]}`;
            assignments[i].time = dt[4];
          }
          console.log(assignments);
          resolve(assignments);
        });
    });
  },
  deleteAssignment: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .deleteOne({ _id: objectId(id) })
        .then(() => {
          resolve();
        });
    });
  },
  getSingleStudentAssignment: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((student) => {
          for (var i in student.assignments) {
            let dt = student.assignments[i].dateTime.trim().split(" ");
            student.assignments[i].date = `${dt[1]} ${dt[2]} ${dt[3]}`;
            student.assignments[i].time = dt[4];
          }
          console.log(student);
          resolve(student.assignments);
        });
    });
  },
  getSubmittedAssignment: (id, studentId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: objectId(studentId) })
        .then((student) => {
          console.log(student);
          let assignment = student.assignments.find((x) => x.id === id);
          console.log(assignment);
          resolve(assignment);
        });
    });
  },
  updateAssignmentMark: (studentId, id, mark) => {
    mark = parseInt(mark);
    console.log(studentId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .updateOne(
          { _id: objectId(studentId), "assignments.id": id },
          {
            $set: {
              "assignments.$.mark": mark,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  addNote: (details, pdfName, VideoName) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTE_COLLECTION)
        .insertOne({
          topic: details.topic,
          video: VideoName,
          pdf: pdfName,
          youtubeLink: details.ytlink,
          dateTime: Date(Date.now()),
        })
        .then(() => {
          resolve();
        });
    });
  },
  getAllNotes: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTE_COLLECTION)
        .find()
        .toArray()
        .then((notes) => {
          for (var i in notes) {
            let dt = notes[i].dateTime.trim().split(" ");
            notes[i].date = `${dt[1]} ${dt[2]} ${dt[3]}`;
            notes[i].time = dt[4];
          }
          resolve(notes);
        });
    });
  },
  deleteNote: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTE_COLLECTION)
        .deleteOne({ _id: objectId(id) })
        .then(() => {
          resolve();
        });
    });
  },
  getAllAttendance: (details) => {
    console.log("details", details);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let splitedDate = details.trim().split("/");
    let date = splitedDate[0];
    let month = monthNames[splitedDate[1] - 1];
    let year = splitedDate[2];
    console.log(`date: ${date}, month: ${month}, year: ${year}`);
    return new Promise(async (resolve, reject) => {
      // let notes = await db.get().collection(collection.NOTE_COLLECTION).find().toArray()
      // console.log(notes)
      let students = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .aggregate([
          {
            $match: {
              "notes.month": month,
              "notes.date": date,
              "notes.year": year,
            },
          },
          { $project: { fname: 1, notes: 1 } },
          {
            $group: {
              _id: { name: "$fname", attendance: "$notes" },
            },
          },
          { $sort: { "_id.name": 1 } },
        ])
        .toArray();
      console.log(students);
      resolve(students);
    });
  },
  addAnnouncement: (
    videoFile = null,
    pdfFile = null,
    imgFile = null,
    details
  ) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ANNOUNCEMENT_COLLECTION)
        .insertOne({
          title: details.title,
          description: details.description,
          pdf: pdfFile,
          imgFile: imgFile,
          video: videoFile,
          dateTime: new Date(),
        })
        .then(() => resolve());
    });
  },
  getAnnouncements: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ANNOUNCEMENT_COLLECTION)
        .find()
        .toArray()
        .then((announcements) => {
          for (var i in announcements) {
            let date = announcements[i].dateTime.getDate();
            const monthNames = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            let month = monthNames[announcements[i].dateTime.getMonth()];
            let year = announcements[i].dateTime.getFullYear();
            announcements[i].date = date + " " + month + " " + year;

            console.log(date, month, year);
          }

          resolve(announcements.reverse());
        });
    });
  },
  getAnnouncements: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ANNOUNCEMENT_COLLECTION)
        .find()
        .toArray()
        .then((announcements) => {
          for (var i in announcements) {
            let date = announcements[i].dateTime.getDate();
            const monthNames = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            let month = monthNames[announcements[i].dateTime.getMonth()];
            let year = announcements[i].dateTime.getFullYear();
            announcements[i].date = date + " " + month + " " + year;

            console.log(date, month, year);
          }

          resolve(announcements.reverse());
        });
    });
  },
  getSingleAnnouncement: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ANNOUNCEMENT_COLLECTION)
        .findOne({ _id: ObjectID(id) })
        .then((announcement) => {
          resolve(announcement);
        });
    });
  },
  addEvent: (videoFile, pdfFile, imgFile, details) => {
    return new Promise((resolve, reject) => {
      details.price = parseInt(details.price);
      let type = details.type == "true" ? true : false;
      db.get()
        .collection(collection.EVENT_COLLECTION)
        .insertOne({
          title: details.title,
          description: details.description,
          pdf: pdfFile,
          imgFile: imgFile,
          video: videoFile,
          isPaid: type,
          price: details.price,
          dateTime: new Date(),
        })
        .then(() => resolve());
    });
  },
  getEvents: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.EVENT_COLLECTION)
        .find()
        .toArray()
        .then((events) => {
          for (var i in events) {
            let date = events[i].dateTime.getDate();
            const monthNames = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            let month = monthNames[events[i].dateTime.getMonth()];
            let year = events[i].dateTime.getFullYear();
            events[i].date = date + " " + month + " " + year;

            console.log(date, month, year);
          }

          resolve(events.reverse());
        });
    });
  },
  addGallery: (fileName, title) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.GALLERY_COLLECTION)
        .insertOne({
          title: title,
          file: fileName,
        })
        .then(() => {
          resolve();
        });
    });
  },
  getAllGalleryItems: () => {
    return new Promise(async (resolve, reject) => {
      let items = await db
        .get()
        .collection(collection.GALLERY_COLLECTION)
        .find({})
        .toArray();
      console.log(items);
      resolve(items);
    });
  },
  deleteGallerySingleItem: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.GALLERY_COLLECTION)
        .deleteOne({ _id: objectId(id) })
        .then(() => {
          resolve({ status: true });
        });
    });
  },
  getSingleEvent: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.EVENT_COLLECTION)
        .findOne({ _id: ObjectID(id) })
        .then((event) => {
          resolve(event);
        });
    });
  },
  getEventPurchasedList: (eventId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { eventId: eventId } },
          {
            $lookup: {
              from: "student",
              localField: "studentId", // field in the orders collection
              foreignField: "_id", // field in the items collection
              as: "student",
            },
          },
          {
            $project: {
              method: 1,
              isPaid: 1,
              dateTime: 1,
              ticketNumber: 1,
              status: 1,
              studentName: { $arrayElemAt: ["$student.fname", 0] },
            },
          },
        ])
        .toArray();
      console.log(orders);
      resolve(orders);
    });
  },
  getTotalStudents: () => {
    return new Promise(async (resolve, reject) => {
      let totalStudents = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .countDocuments();
      if (!totalStudents) resolve(0);

      resolve(totalStudents);
    });
  },
  getLastAssignmentReceivedCount: () => {
    return new Promise(async (resolve, reject) => {
      let lastAssignment = await db
        .get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .limit(1)
        .toArray();

      //   lastAssignmentId = lastAssignment[0]._id;
      let count = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .aggregate([{ $project: { count: { $size: "$assignments" } } }])
        .toArray();

      console.log(count[0].count);
      resolve(count[0].count);
    });
  },
  getTotalAttendanceCount: () => {
    return new Promise(async (resolve, reject) => {
      let lastNote = await db
        .get()
        .collection(collection.NOTE_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .limit(1)
        .toArray();
      if (!lastNote) resolve(0);

      let lastNoteId = lastNote[0]._id;
      let count = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .find({ notes: { $elemMatch: { noteId: objectId(lastNoteId) } } })
        .toArray();
      console.log(lastNoteId);
      console.log(count);
      console.log(count.length);
      resolve(count.length);
    });
  },
  getCurrentDate: () => {
    return new Promise((resolve, reject) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      let dt = new Date();
      let date = dt.getDate();
      let month = monthNames[dt.getMonth()];
      let year = dt.getFullYear();
      console.log(`${date} ${month} ${year}`);
      resolve(`${date} ${month} ${year}`);
    });
  },
};
