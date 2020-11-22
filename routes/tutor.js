var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/Dashboard', function(req, res, next) {
  res.render('tutor/dashboard')
});

router.get('/login', (req, res)=>{
  res.send('login')
})

module.exports = router;
