var express = require('express');
var router = express.Router();
var studentHelpers = require('../helpers/student-helpers');
var path = require('path')
var multer = require('multer')

const submitAssignmentStorage = multer.diskStorage({
  destination:`${__dirname}/../public/pdf/students/assignments/`,
  filename:(req, file, cb)=>{
    const fileName = `${Date.now()}${path.extname(file.originalname)}`
    req.session.studentAssignmentSubmitted = fileName
    cb(null, fileName)
  }
})

const submitAssignment = multer({storage:submitAssignmentStorage})

const verifyLogin = (req, res, next)=>{
  req.session.studentPreviousPath = false
  if(req.session.studentLoggedIn){
    req.session.studentPreviousPath = req.path
    next()
  }else{
    req.session.redirectTo = req.path
    res.redirect('/login')
  }
}

router.get('/',verifyLogin, (req, res)=>{
  
    res.render('student/dashboard',{
      title:'students dashboard',
      student: req.session.student
    }) 
  
})

router.get('/activate', function(req, res, next) {
  res.render('student/student-activate');
});

router.post('/send-otp',(req, res)=>{

  req.session.studentNum = req.body.phone
  
  studentHelpers.sendOtp(req.body.phone)
  .then((otp_id)=>{
    req.session.otpId = otp_id;
    console.log(otp_id);
    res.json({status:true})
  })
  .catch(()=>{
    res.json({status:false})
  })
})

router.post('/verify-otp', (req, res)=>{
  studentHelpers.verifyOtp(req.body.otp, req.session.otpId).then((response)=>{
    if (response.status == 'success'){
      req.session.otpVerified = true;
    }
    res.json(response)
  })
})

router.get('/register',(req, res)=>{
  res.render('student/register')
})

router.post('/register',(req, res)=>{
  studentHelpers.register(req.session.studentNum, req.body.password).then(async()=>{
    req.session.otpVerified = false;
    studentHelpers.getStudent(req.session.studentNum).then((student)=>{
      req.session.student = student;
      req.session.studentLoggedIn = true
      res.redirect('/')
    })
  })
})

router.get('/login',(req, res)=>{
  if(req.session.studentLoggedIn){

    if(req.session.studentPreviousPath){
      location = req.session.studentPreviousPath
      console.log('previous path');
    }else{
      location = req.session.redirectTo ? req.session.redirectTo :'/'
    }
    res.redirect(location)
  }else{
    res.render('student/login',{loginError:req.session.loginError})
    req.session.loginError = false
  }
})

router.post('/login',(req, res)=>{
  studentHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.student = response.user
      req.session.studentLoggedIn = true
      
    res.redirect('/')
      
    }else{
      req.session.loginError = response.message
      res.redirect('/login')
    }
  })
})

router.get('/attendance',verifyLogin, (req, res)=>{
  res.render('student/attendance',{
    title:'Attendance',
    student: req.session.student
  })
})

router.get('/logout',(req, res)=>{
  req.session.studentLoggedIn = false;
  req.session.student = null;
  res.redirect('/login')
})

router.get('/task', verifyLogin, (req, res)=>{
  res.render('student/task',{
    student:req.session.student,
    title:"Today's Task"
  })
})

router.get('/profile', verifyLogin, (req, res)=>{
  res.render('student/profile',{
    student:req.session.student,
    title:'profile'
  })
})

router.get('/assignments', verifyLogin,async (req, res)=>{
let assignments = await studentHelpers.getAllAssignments(req.session.student._id)
  res.render('student/assignments',{
    title:'assignments',
    assignments:assignments,
    student:req.session.student
  })
})

router.get('/notes', verifyLogin, (req, res)=>{
  res.render('student/notes',{
    title:'Notes',
    student:req.session.student
  })
})

router.get('/assignment/:id',verifyLogin, async(req, res)=>{
let assignment = await studentHelpers.getSingleAssignment(req.params.id)
  res.render('student/single-assignment',{
    title:'assignment',
    student:req.session.student,
    assignment:assignment
  })
})

router.post('/assignment/submit/:id', submitAssignment.single('pdf') ,(req, res)=>{
  let filename = req.session.studentAssignmentSubmitted
  studentHelpers.submitAssignments(req.body, req.session.student.phone, filename, req.params.id).then(()=>{
    req.session.studentAssignmentSubmitted = null
    res.redirect('/tutor/assignments')
  })
})

router.get('/otp-login',(req, res)=>{
  if(req.session.studentLoggedIn){
    res.redirect('/')
  }else{
    res.render('student/otp-login',{
      title:'otp Login'
    })
  }
})

router.post('/otp-login', (req, res)=>{
  studentHelpers.verifyOtp(req.body.otp, req.session.otpId).then((response)=>{
    if (response.status == 'success'){
      req.session.otpVerified = true;
      studentHelpers.otpLogin(req.session.otpVerified, req.session.studentNum).then((student)=>{
        req.session.student = student
        req.session.studentLoggedIn = true
        res.json({status:'success'})
      })

    }
    
  })
})



module.exports = router;
