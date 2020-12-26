const db = require('../config/database')
const collection = require('../config/collection')
var Razorpay = require('razorpay');
const { ObjectID } = require('mongodb');


var instance = new Razorpay({
    key_id: 'rzp_test_EsSSMmdD95LM7v',
    key_secret: 'd5yEvJGS0fe4zBCJYUQSosBX',
  });

module.exports = {
    generateRazorPay:(details, orderId)=>{
        return new Promise((resolve, reject) => {
            var options = {
                amount: parseInt(details.price)*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err)console.log(err);
                if(order)resolve(order)
              });
        })
        
    },
    createOrder:(studentId, eventId, method)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
            .insertOne({
                eventId:eventId,
                studentId:studentId,
                dateTime:new Date,
                status:"pending",
                isPaid:false,
                method:method
            }).then((response)=>{
                resolve(response.insertedId)
            })
        })
        
    },
    verifyPayment:(details)=>{
        return new Promise((resolve, reject) => {
            const crpto = require('crypto')
            let hmac = crpto.createHmac('sha256', 'd5yEvJGS0fe4zBCJYUQSosBX')
            console.log(details);
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            console.log(hmac);
            if(hmac==details['payment[razorpay_signature]']){
                console.log(' payment verified');

                resolve()
            }else{
                reject()
                console.log('rejected payment');
            }
        })
        
    },
    confirmPurchase:(orderId, razorpayOrderId)=>{
        return new Promise((resolve, reject) => {
            var ticketId = Date.now()
            console.log('date,', ticketId);
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {_id:ObjectID(orderId)},
                {$set:{
                    status:'completed',
                    isPaid:true,
                    ticketNumber:ticketId,
                    razorpayOrderId:razorpayOrderId
                    
                }}
            ).then(()=>{
                resolve(ticketId)
            })
        })
        
    }
}