var express = require('express');
const tutorHelpers = require('../helpers/tutor-helpers');
var router = express.Router();
var sidebarToggle = require('../controller/sidebar-toggler').toggler
var path = require('path')
const multer = require('multer')





const storage = multer.diskStorage({
  destination:`${__dirname}/../public/uploads/tutor/`,
  filename:(req, file, cb)=>{
    const fileName = `${Date.now()}${path.extname(file.originalname)}`;
    tutorHelpers.updateProfilePic(req.session.tutor.email, fileName).then(()=>{
      cb(null, fileName)
    })
  }
})

const pdfStorage = multer.diskStorage({
  destination:`${__dirname}/../public/pdf/tutor/assignments/`,
  filename:(req, file, cb)=>{
    const fileName = `${Date.now()}${path.extname(file.originalname)}`
    req.session.TutorAssignmentAdded = fileName
    cb(null, fileName)
  }
})

const noteStorage = multer.diskStorage({
  destination:`${__dirname}/../public/uploads/notes/`,
  filename:(req, file, cb)=>{
    const fileName = `${Date.now()}${path.extname(file.originalname)}`
    if(req.session.NoteFilePdf){
      req.session.NoteFileVideo = fileName
    }else{
      req.session.NoteFilePdf = fileName
    }
    cb(null, fileName)
  }
})

const announcementStorage = multer.diskStorage({
  destination:`${__dirname}/../public/uploads/announcment/`,
  filename:(req, file, cb)=>{
    let fileName = `${Date.now()}${path.extname(file.originalname)}`
    cb(null, fileName)
  }
})

const eventStorage = multer.diskStorage({
  destination:`${__dirname}/../public/uploads/event/`,
  filename:(req, file, cb)=>{
    let fileName = `${Date.now()}${path.extname(file.originalname)}`
    cb(null, fileName)
  }
})

const galleryStorage = multer.diskStorage({
  destination:`${__dirname}/../public/uploads/gallery/`,
  filename:(req, file, cb)=>{
    let fileName = `${Date.now()}${path.extname(file.originalname)}`
    cb(null, fileName)
  }
})

const newStudentStorage = multer.diskStorage({
  destination:`${__dirname}/../public/uploads/student/`,
  filename:(req, file, cb)=>{
    let fileName = `${Date.now()}${path.extname(file.originalname)}`
    cb(null, fileName)
  }
})

const uploadPdf = multer({storage:pdfStorage})

const uploadImage = multer({storage}).single('photo')

const uploadNote = multer({storage:noteStorage})

const UploadAnnouncement = multer({storage:announcementStorage})

const uploadEvent = multer({storage:eventStorage})

const uploadGallery = multer({storage:galleryStorage})

const newStudent = multer({storage:newStudentStorage})


const verifyLogin = (req, res, next)=>{
  req.session.previousPath = false
  if(req.session.tutorLoggedIn){
    req.session.previousPath = req.path
    next()
  }else{
    req.session.tutorRedirectTo = req.path
    res.redirect('/tutor/login')
  }
}

router.get('/',(req, res)=>{
  res.redirect('/tutor/dashboard')
})

/* GET users listing. */
router.get('/Dashboard',verifyLogin,async function(req, res, next) {
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let announcements = await tutorHelpers.getAnnouncements()
  let events = await tutorHelpers.getEvents()

  res.render('tutor/dashboard',{
  title:"Tutor Dashboard", 
  profilePic:image,
  announcements,
  tutor:true, 
  events,
  tutorName:tutorName,
  dashboard:sidebarToggle})
});

router.get('/all-students',verifyLogin,async (req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let students = await tutorHelpers.getAllStudents()
  let studentEdited = req.session.editStudent
  let studentAdded = req.session.studentAdded

  res.render('tutor/all-students', {
    title:'All Students',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,
    studentAdded:studentAdded,
    isStudentEdited:studentEdited,
    students:students,
    all_students:sidebarToggle  
  })
  req.session.editStudent = false
  req.session.studentAdded = false
})

router.get('/admission',verifyLogin,async (req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let newAdmissionNum = await tutorHelpers.getNewAdmissionNo()


  res.render('tutor/admission', {
    title:'Student Admission Form',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,
    admissionNum:newAdmissionNum,
    student_admission:sidebarToggle  
  })
  
})

router.get('/attendance',verifyLogin,async (req, res)=>{
  console.log(req.query.date)
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let currentDate, attendanceData, reqDate = req.query.date;
  if(!reqDate){
    console.log('normal route');
    let dt = new Date()
    console.log(dt);
    currentDate = dt.getDate()+'/'+dt.getMonth()+"/"+dt.getFullYear()
    attendanceData = await tutorHelpers.getAllAttendance(currentDate)
    attendanceData.current = currentDate
    console.log('data');
    console.log(attendanceData);
  }else{
    console.log('searched route');
    attendanceData = await tutorHelpers.getAllAttendance(req.query.date)
    attendanceData.current = req.query.date
  }
  
  console.log(attendanceData.current);
  res.render('tutor/attendance',{
    title:'Attendance',
    tutor:true,
    profilePic:image,
    tutorName:tutorName,
    attendance:sidebarToggle,
    attendanceData
  })
})

router.get('/announcement',verifyLogin,async (req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let announcements = await tutorHelpers.getAnnouncements()
  
  res.render('tutor/announcement', {
    title:'Announcement',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,
    announcements,
    announcement:sidebarToggle
  })
})

router.get('/assignments',verifyLogin,async(req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let assignments = await tutorHelpers.getAssignments()
  

  res.render('tutor/assignments',{
    title:'All Asssignments',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,
    assignmentsDetails:assignments,

    assignments:sidebarToggle
  })
})

router.get('/add-assignment',verifyLogin,async(req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)

  res.render('tutor/add-assignment',{
    title:"Add assignment",
    tutor:true,
    tutorName:tutorName,
    profilePic:image,

    add_assignments:sidebarToggle
  })
})

router.get('/profile',verifyLogin,async(req, res)=>{
  let tutorProfile = await tutorHelpers.getTutorProfile(req.session.tutor.email)
  console.log(tutorProfile);
  res.render('tutor/profile',{
    title:'Profile',
    tutor:true,
    profile:sidebarToggle,
    profileDetails:tutorProfile,
    profilePic:tutorProfile.image,
    tutorName:tutorProfile.name
  })
})

router.get('/login', (req, res)=>{

  if(req.session.tutorLoggedIn){

    if(req.session.previousPath){
      location = '/tutor'+req.session.previousPath
      console.log('previous path');
    }else{
      location = req.session.tutorRedirectTo ? '/tutor'+req.session.tutorRedirectTo :'/tutor/dashboard'
    }
    res.redirect(location)
  }else{
    res.render('tutor/login',{loginError:req.session.loginError})
    req.session.loginError = false
  }
})

router.post('/login', (req, res)=>{
  tutorHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.tutor = response.user
      req.session.tutorLoggedIn = true
      console.log('req redirect',req.session.tutorRedirectTo);
      let location;
      if(req.session.previousPath){
        location = '/tutor'+ req.session.previousPath === "" ? "/Dashboard" : req.session.previousPath
        console.log('previous path');
      }else{
        location = req.session.tutorRedirectTo ? '/tutor'+req.session.tutorRedirectTo :'/tutor/dashboard'
      }
      console.log('location: '+location);

    res.redirect(location)
      
    }else{
      req.session.loginError = response.message
      res.redirect('/tutor/login')
    }
  })

})

router.get('/logout',(req, res)=>{
  req.session.tutorLoggedIn = false;
  req.session.tutor = null;
  res.redirect('/tutor/login')
})

router.get('/edit-profile',verifyLogin,async(req, res)=>{
  let tutorProfile = await tutorHelpers.getTutorProfile(req.session.tutor.email)  
  res.render('tutor/edit-profile',{
    tutor:true,
    title:'Edit Profile',
    profile:sidebarToggle,
    profileDetails:tutorProfile,
    profilePic:tutorProfile.image,


  })
})

router.post('/edit-profile',verifyLogin, async(req, res)=>{
  console.log(req.body);
  tutorHelpers.updateProfile(req.body, req.session.tutor.email).then(()=>{
    req.session.tutor.email = req.body.email
    res.redirect('/tutor/profile')
  })
})

router.post('/editprofile-image', uploadImage, (req, res)=>{
  console.log('api call');

  res.redirect('/tutor/profile')
})

router.post('/admission',newStudent.single('profile'), (req, res)=>{
  console.log(req.body);
  tutorHelpers.studentRegister(req.body).then(()=>{
    req.session.studentAdded = true
    
    tutorHelpers.increaseAdmissionNum().then(()=>{
      res.end()
    })
  })
})

router.post('/delete/:id',(req, res)=>{
  let id  = req.params.id
  tutorHelpers.deleteStudent(id).then(()=>{
    res.json({status:true})
  })
})

router.get('/edit/:id',verifyLogin, async (req, res)=>{
  let id  = req.params.id
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let student = await tutorHelpers.getOneStudent(id)
  let isMale =  student.gender=='Male' ?  true:false
  res.render('tutor/edit-student',{ 
    tutor:true,
    student,
    isMale,
    title:'Edit student',
    tutorName:tutorName,
    profilePic:image,
  })
})

router.post('/edit', (req, res)=>{
  console.log(req.body);
  tutorHelpers.editStudent(req.body).then(()=>{
    req.session.editStudent = true
    res.json({status:true})
  })
})

router.post('/upload-studentImg',(req, res)=>{
  console.log('body :',req.body)
  console.log('file :',req.file)
  console.log('files :',req.files)
  // console.log('req :',req)
  res.json({status:'success'})
})

router.post('/add-assignment', uploadPdf.single('pdf'), (req, res)=>{
  console.log('called add assignment');
  let filename = req.session.TutorAssignmentAdded
  console.log(req.body);
  tutorHelpers.addAssignments(req.body, filename).then(()=>{
    req.session.TutorAssignmentAdded = null
    res.end()
  })
})

router.post('/assignments/delete/:id',(req, res)=>{
  tutorHelpers.deleteAssignment(req.params.id).then(()=>{
    res.json({status:true})
  })
})

router.get('/all-students/:id', verifyLogin,async (req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let assignments = await tutorHelpers.getSingleStudentAssignment(req.params.id)
  req.session.currentStudentId = req.params.id
  let student = await tutorHelpers.getOneStudent(req.params.id)
  res.render('tutor/single-student-details',{
    title:'student',
    tutor:req.session.tutor,
    assignments,
    tutorName,
    student,
    profilePic:image
  })
})

router.get('/assignment/:id', verifyLogin, async (req, res)=>{
  if(!req.session.currentStudentId) res.redirect('/tutor/all-students')
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)

  let assignment = await tutorHelpers.getSubmittedAssignment(req.params.id, req.session.currentStudentId)
  let student = await tutorHelpers.getOneStudent(req.session.currentStudentId)
  console.log(student);
  if(!assignment) res.redirect('/tutor/dashboard')
  res.render('tutor/assignment-by-student',{
    tutor:req.session.tutor,
    assignment,
    tutorName,
    title:student.fname,
    student,
    profilePic:image
  })
})

router.post('/assignment-mark', (req, res)=>{
  console.log('api callllll');
  console.log(req.body);
  tutorHelpers.updateAssignmentMark(req.session.currentStudentId, req.body.id, req.body.mark).then(()=>{
    res.json({status:true})
  })
})

router.get('/notes', verifyLogin ,async (req, res)=>{

  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let notes = await tutorHelpers.getAllNotes()
  res.render('tutor/all-notes',{
    title:'All notes',
    tutor:req.session.tutor,
    tutorName,
    profilePic:image,
    notes
  })
})

router.get('/add-note', verifyLogin ,async (req, res)=>{

  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  res.render('tutor/add-note',{
    title:'Add note',
    tutor:req.session.tutor,
    tutorName,
    profilePic:image
  })
})

router.post('/add-note', uploadNote.fields([{name:'pdf', maxCount:1},{name:"video", maxCount:1}]), (req, res)=>{
  console.log('video uploaded');
  console.log(req.session.NoteFilePdf);
  console.log(req.session.NoteFileVideo);
  tutorHelpers.addNote(req.body, req.session.NoteFilePdf, req.session.NoteFileVideo).then(()=>{
    res.end()
  })

})

router.post('/note/delete/:id', (req, res)=>{
  tutorHelpers.deleteNote(req.params.id).then(()=>{
    res.json({status:true})
  })
})




router.post('/add-announcement',UploadAnnouncement.fields([{name:'pdf', maxCount:1},{name:"video", maxCount:1},{name:"img", maxCount:1}]), (req, res)=>{

  let pdf = req.files.pdf[0].filename
  let video = req.files.video[0].filename
  let image = req.files.img[0].filename
  console.log(`Video:${video} ,img:${image} pdf: ${pdf}`);
  console.log(req.body);
  tutorHelpers.addAnnouncement(video, pdf, image, req.body).then(()=>{
    res.end()
  })


})

router.get('/announcement/:id', verifyLogin,async (req, res)=>{
  let announcement = await tutorHelpers.getSingleAnnouncement(req.params.id)
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  
  console.log(announcement);
  res.render('tutor/single-announcement',{
    tutor:req.session.tutor,
    title:announcement.title,
    announcement,
    tutorName,
    profilePic:image
  })
})

router.get('/event',verifyLogin,async (req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
let events = await tutorHelpers.getEvents()
console.log(events);
  res.render('tutor/event',{
    title:'Event',
    tutor:req.session.tutor,
    events,
    tutorName,
    profilePic:image
  })
})

router.post('/event',uploadEvent.fields([{name:'pdf', maxCount:1},{name:"video", maxCount:1},{name:"img", maxCount:1}]), (req, res)=>{
  let image = req.files.img ? req.files.img[0].filename : null
  let video = req.files.video ? req.files.video[0].filename :null
  let pdf = req.files.pdf ? req.files.pdf[0].filename : null
  console.log(req.body);
  tutorHelpers.addEvent(video, pdf, image, req.body).then(()=>{
    res.end()
  })

})

router.get('/gallery',verifyLogin, async(req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let galleryItems = await tutorHelpers.getAllGalleryItems()
  console.log('gallery items:'+galleryItems);
  res.render('tutor/gallery',{
    tutor:req.session.tutor,
    title:'Gallery',
    tutorName,
    profilePic:image,
    galleryItems
  })
})

router.post('/gallery', uploadGallery.single('img'),(req,res)=>{
  console.log(req.body.title);
  console.log(req.file.filename);
  tutorHelpers.addGallery(req.file.filename, req.body.title).then(
    res.end()
  )
  
})

router.post('/gallery/delete',(req, res)=>{
  let id = req.body.id
  console.log(id);
  tutorHelpers.deleteGallerySingleItem(id).then((status)=>{
    res.json(status)
  })
})

router.get('/event/:id',verifyLogin,async(req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  let event = await tutorHelpers.getSingleEvent(req.params.id)
  let orders = await tutorHelpers.getEventPurchasedList(req.params.id)
  res.render('tutor/single-event',{
    tutor:req.session.tutor,
    tutorName,
    profilePic:image,
    title:'event details',
    event,
    orders
  })
})

module.exports = router;
