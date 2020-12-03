const bcrypt = require('bcrypt')
const { response } = require('../app')
const db = require('../config/database')
const collection = require('../config/collection')
const objectId = require('mongodb').ObjectID

module.exports = {
    doLogin:(details)=>{
       return new Promise(async(resolve, reject) => {
           let response = {}
           var user = await db.get().collection(collection.TUTOR_COLLECTION).findOne({email:details.username})
           
           console.log(user);
           if (user == null) {
               console.log('login failed');
               resolve({status:false, message:'username not found'})
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
        
    },
    getTutorProfile:(username)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TUTOR_COLLECTION).findOne({email:username}).then((tutor)=>{
                resolve(tutor)
            })
        })
        
    },
    getTutorName:(username)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TUTOR_COLLECTION).findOne({email:username}).then((tutor)=>{
                resolve(tutor.name)
            })
        })
    },
    updateProfile:(details, username)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TUTOR_COLLECTION)
            .updateOne({email:username},{
                $set:{
                    name:details.name,
                    gender:details.gender,
                    dob:details.dob,
                    email:details.email,
                    phone:details.phone
                }
            }).then(()=>{
                resolve()
            })
        })
        
    },
    getProfilePic:(username)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TUTOR_COLLECTION)
            .findOne({email:username})
            .then((tutor)=>{
                resolve(tutor.image)
            })
        })
        
    }
}