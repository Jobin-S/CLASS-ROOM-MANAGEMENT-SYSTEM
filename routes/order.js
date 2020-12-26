var express = require('express');
var router = express.Router();
const { generateRazorPay, createOrder, verifyPayment, confirmPurchase } = require('../helpers/order-helpers');



router.post('/razorpay', (req, res)=>{
  createOrder(req.session.student._id, req.body.id, "razorpay").then((orderId)=>{
    generateRazorPay(req.body, orderId).then((order)=>{
      res.json(order)
    })
  })
})

router.post('/razorpay/verify', (req, res)=>{
  verifyPayment(req.body)
  .then(()=>{
    confirmPurchase(req.body['order[receipt]'], req.body['payment[razorpay_order_id]']).then((ticketId)=>{
      console.log('ticketId: ',ticketId );
      req.session.student.lastPurchasedTicket = ticketId;
      res.json({status:true})
    })
  })
  .catch(()=>{
    res.json({status:false})
  })
})

module.exports = router;
