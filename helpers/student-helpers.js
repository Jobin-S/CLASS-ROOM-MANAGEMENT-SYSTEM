const db = require('../config/database')
const collection = require('../config/collection')
const { post } = require('../app')
const objectId = require('mongodb').ObjectID
require('dotenv').config()
var unirest = require('unirest');


module.exports = {
    sendOtp:(phone)=>{
        return new Promise((resolve, reject) => {
            var req = unirest('POST', 'https://d7networks.com/api/verifier/send')
            .headers({
                'Authorization': `Token ${process.env.TOKEN}`
            })
            .field('mobile', '91'+phone)
            .field('sender_id', 'SMSINFO')
            .field('message', 'Your otp for ECLASS activation is {code}')
            .field('expiry', '900')
            .end(function (res) {
              resolve(res.body.otp_id)
            });
        })
        
    },
    verifyOtp:(otp, otp_id)=>{
        return new Promise((resolve, reject) => {
            var req = unirest('POST', 'https://d7networks.com/api/verifier/verify')
            .headers({
              'Authorization': `Token ${process.env.TOKEN}`
            })
            .field('otp_id', otp_id)
            .field('otp_code', otp)
            .end(function (res) { 
              
              console.log(res.body);
              resolve(res.body)
            });
        })
        
    }
       
}

