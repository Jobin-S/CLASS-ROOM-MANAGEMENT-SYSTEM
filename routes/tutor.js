var express = require('express');
const tutorHelpers = require('../helpers/tutor-helpers');
var router = express.Router();
var sidebarToggle = require('../controller/sidebar-toggler').toggler

const verifyLogin = (req, res, next)=>{
  req.session.previousPath = false
  if(req.session.userLoggedIn){
    req.session.previousPath = req.path
    next()
  }else{
    req.session.redirectTo = req.path
    res.redirect('/tutor/login')
  }
}


/* GET users listing. */
router.get('/Dashboard',verifyLogin, function(req, res, next) {
  res.render('tutor/dashboard',{
  title:"Tutor Dashboard", 
  tutor:true, 
  dashboard:sidebarToggle})
});

router.get('/all-students',verifyLogin, (req, res)=>{
  res.render('tutor/all-students', {
    title:'All Students',
    tutor:true,
    all_students:sidebarToggle  
  })
})

router.get('/admission',verifyLogin, (req, res)=>{
  res.render('tutor/admission', {
    title:'Student Admission Form',
    tutor:true,
    student_admission:sidebarToggle  
  })
})

router.get('/attendance',verifyLogin, (req, res)=>{
  res.render('tutor/attendance',{
    title:'Attendance',
    tutor:true,
    attendance:sidebarToggle
  })
})

router.get('/notice',verifyLogin, (req, res)=>{
  res.render('tutor/notice', {
    title:'Notice Board',
    tutor:true,
    notice:sidebarToggle
  })
})

router.get('/assignments',verifyLogin,(req, res)=>{
  res.render('tutor/assignments',{
    title:'All Asssignments',
    tutor:true,
    assignments:sidebarToggle
  })
})

router.get('/add-assignment',verifyLogin,(req, res)=>{
  res.render('tutor/add-assignment',{
    title:"Add assignment",
    tutor:true,
    add_assignments:sidebarToggle
  })
})

router.get('/profile',verifyLogin,(req, res)=>{
  res.render('tutor/profile',{
    title:'Profile',
    tutor:true,
    profile:sidebarToggle
  })
})

router.get('/login', (req, res)=>{

  if(req.session.userLoggedIn){

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
      req.session.user = response.user
      req.session.userLoggedIn = true
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

module.exports = router;
