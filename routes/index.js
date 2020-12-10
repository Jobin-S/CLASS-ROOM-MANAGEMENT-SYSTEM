var express = require('express');
var router = express.Router();
var studentHelpers = require('../helpers/student-helpers')


router.get('/', (req, res)=>{
  if(req.session.studentLoggedIn){
    res.render('index',{title:'students dashboard',student: req.session.student}) 
  }else{
    res.redirect('/login')
  }
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

router.get('/login', (req, res)=>{
  if(req.session.studentLoggedIn){
    res.redirect('/')
  }else{
    res.render('student/login',{loginError:req.session.loginError})
    req.session.loginError = null
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

module.exports = router;
