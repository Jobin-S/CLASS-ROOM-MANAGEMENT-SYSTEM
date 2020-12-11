const db = require('../config/database')
const collection = require('../config/collection')
const { post } = require('../app')
const objectId = require('mongodb').ObjectID
require('dotenv').config()
var unirest = require('unirest');
const bcrypt = require('bcrypt')


module.exports = {
    sendOtp:(phone)=>{
        
        return new Promise(async(resolve, reject) => {
            let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({phone:phone})
            if (!student) reject()
            var req = unirest('POST', 'https://d7networks.com/api/verifier/send')
            .headers({
                'Authorization': `Token ${process.env.TOKEN}`
            })
            .field('mobile', '91'+phone)
            .field('sender_id', 'SMSINFO')
            .field('message', 'Your otp for ECLASS activation is {code}')
            .field('expiry', '900')
            .end(function (res) {
              console.log(res.body);
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
        
    },
    register:(phone, password)=>{
      return new Promise(async(resolve, reject) => {
        let hashedPassword =await bcrypt.hash(password, 10)
        db.get().collection(collection.STUDENT_COLLECTION).updateOne({phone:phone},{
          $set:{
            password:hashedPassword
          }
        }).then(()=>{
          resolve()
        })
      })
      
    },
    getStudent:(phone)=>{
      return new Promise((resolve, reject) => {
        db.get().collection(collection.STUDENT_COLLECTION).findOne({phone:phone}).then((student)=>{
          resolve(student)
        })
      })
      
    },
    doLogin:(details)=>{
      return new Promise(async(resolve, reject) => {
        let response = {}
           var user = await db.get().collection(collection.STUDENT_COLLECTION).findOne({phone:details.phone})
           
           console.log(user);
           if (user == null) {
               console.log('login failed');
               resolve({status:false, message:'Phone num not found'})
            }else{
                bcrypt.compare(details.password, user.password).then((status)=>{
                    if (status){
                        console.log('login succesfull');
                        response.user = user;
                        response.status = status
                        
                        resolve(response)
                    }else{
                        console.log('failed');
                        resolve({status:false, message:'password Incorrect'})
                    }
                })
            }
      })
      
    }
       
}

