var express = require('express');
var router = express.Router();
var studentHelpers = require('../helpers/student-helpers')


router.get('/activate', function(req, res, next) {
  res.render('student/student-activate');
});

router.post('/send-otp',(req, res)=>{
  res.session.studentNum = req.body.phone
  studentHelpers.sendOtp(req.body.phone).then((otp_id)=>{
    req.session.otpId = otp_id;
    console.log(otp_id);
    res.json({status:true})
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

module.exports = router;
