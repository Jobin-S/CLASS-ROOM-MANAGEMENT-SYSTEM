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
    cb(null, fileName)
  }
})

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

  res.render('tutor/all-students', {
    title:'All Students',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,

    all_students:sidebarToggle  
  })
})

router.get('/admission',verifyLogin,async (req, res)=>{
  let tutorName = await tutorHelpers.getTutorName(req.session.tutor.email)
  let image = await tutorHelpers.getProfilePic(req.session.tutor.email)

  res.render('tutor/admission', {
    title:'Student Admission Form',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,

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

  res.render('tutor/assignments',{
    title:'All Asssignments',
    tutor:true,
    tutorName:tutorName,
    profilePic:image,

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
  if(req.file) return res.redirect('/tutor/profile')
})

module.exports = router;
