const db = require('../config/database')
const collection = require('../config/collection')
var Razorpay = require('razorpay');
const { ObjectID } = require('mongodb');
var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AWJTfdS6KtyeZRimNpK4F3_XrY55mLmpLvEQMPaVL2U8oKGgP21-KJ3dFVSr5jxqqzq-2rySgh2XMIad',
    'client_secret': 'EMEqHg3dGiFSg7HlSGvULCJM5aClz_fu63F3BhjM__r-HKv-xcjXSH7ev51yX3cEuCU4Urh2KxmSPlGU'
  });

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
        
    },
    paypalPay:(details, orderId)=>{
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/order/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": details['event[title]'],
                            "sku": orderId,
                            "price": parseInt(details['event[price]']),
                            "currency": "INR",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "INR",
                        "total": parseInt(details['event[price]'])
                    },
                    "description": details['event[description]']
                }]
            };
            console.log(create_payment_json);
            paypal.payment.create(create_payment_json, function (error, payment) {
              if (error) {
                  throw error;
              } else {
                  for(let i = 0;i < payment.links.length;i++){
                    if(payment.links[i].rel === 'approval_url'){
                        console.log(payment.links[i].href);
                      resolve(payment.links[i].href);
                    }
                  }
              }
            });
            
        })
        
    },
    verifyPaypal:(payerId, paymentId, price)=>{
        return new Promise((resolve, reject) => {
            const execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "INR",
                        "total": parseInt(price)
                    }
                }]
              };
            
              paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    console.log(JSON.stringify(payment));
                    resolve({status:true})
                }
            });
        })
        
    },
    paypalConfirmPurchase:(orderId, paypalPaymentId)=>{
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
                    paypalPaymentId:paypalPaymentId
                    
                }}
            ).then(()=>{
                resolve(ticketId)
            })
        })
        
    }
}