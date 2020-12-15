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

const uploadPdf = multer({storage:pdfStorage})

const uploadImage = multer({storage}).single('photo')

const verifyLogin = (req, res, next)=>{
  req.session.previousPath = false
  if(req.session.tutorLoggedIn){
    req.session.previousPath = req.path
    next()
  }else{
    req.session.redirectTo = req.path
    res.redirect('/tutor/login')
  }
}


/* GET users listing. */
router.get('/Dashboard',verifyLogin,async function(req, res, next) {
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)

  res.render('tutor/dashboard',{
  title:"Tutor Dashboard", 
  profilePic:image,

  tutor:true, 
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
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)

  res.render('tutor/attendance',{
    title:'Attendance',
    tutor:true,
    profilePic:image,
    tutorName:tutorName,
    attendance:sidebarToggle
  })
})

router.get('/notice',verifyLogin,async (req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)
  

  res.render('tutor/notice', {
    title:'Notice Board',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,

    notice:sidebarToggle
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
      location = req.session.redirectTo ? '/tutor'+req.session.redirectTo :'/tutor/dashboard'
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
      console.log('req redirect',req.session.redirectTo);
      let location;
      if(req.session.previousPath){
        location = '/tutor'+req.session.previousPath
        console.log('previous path');
      }else{
        location = req.session.redirectTo ? '/tutor'+req.session.redirectTo :'/tutor/dashboard'
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

router.post('/admission', (req, res)=>{
  tutorHelpers.studentRegister(req.body).then(()=>{
    req.session.studentAdded = true
    tutorHelpers.increaseAdmissionNum().then(()=>{
      res.redirect('/tutor/all-students')
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
  let filename = req.session.TutorAssignmentAdded
  tutorHelpers.addAssignments(req.body, filename).then(()=>{
    req.session.TutorAssignmentAdded = null
    res.redirect('/tutor/assignments')
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
  res.render('student/single-student-details',{
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
  res.render('student/assignment-by-student',{
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

module.exports = router;
