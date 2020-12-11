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
                let image = !tutor.image ? 'defaultProfilePic.jpg' : tutor.image
                resolve(image)
            })
        })
    },
    updateProfilePic:(username, image)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TUTOR_COLLECTION)
            .updateOne({email:username},{
                $set:{
                    image:image
                }
            }).then(()=>{
                console.log('profile picture updated');
                resolve()
            })
        })
        
    },
    getNewAdmissionNo:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CLASS_INFO_COLLECTION)
            .findOne().then((info)=>{
                resolve(info.lastAdmissionNum+1)
            })
        })
        
    },
    studentRegister:(details)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION).insertOne(details).then(()=>{
                resolve()
            })
        })
        
    },
    getAllStudents:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION).find({}).toArray().then((students)=>{
                console.log(students);
                resolve(students)
            })
        })
        
    },
    increaseAdmissionNum:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CLASS_INFO_COLLECTION)
            .updateOne({_id:objectId('5fc9b867640f9416cb653859')},{
                $inc:{'lastAdmissionNum':1}
            }).then(()=>{
                resolve()
            })
        })
        
    },
    deleteStudent:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION)
            .deleteOne({_id:objectId(id)}).then(()=>{
                resolve()
            })
        })
    },
    getOneStudent:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION)
            .findOne({_id:objectId(id)}).then((student)=>{
                resolve(student)
            })
        })
        
    },
    editStudent:(details)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION)
            .updateOne({_id:objectId(details._id)},{
                $set:{
                    fname:details.fname,
                    lname:details.lname,
                    gender:details.gender,
                    dob:details.dob,
                    phone:details.phone,
                    email:details.email
                }
            }).then(()=>{resolve()})
        })
        
    },
    addAssignments:(details, fileName)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ASSIGNMENT_COLLECTION)
            .insertOne({
                topic:details.topic,
                dateTime:Date(Date.now()),
                file:fileName
            }).then(()=>{ 
                resolve()
            })
        })
        
    },
    getAssignments:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ASSIGNMENT_COLLECTION)
            .find().toArray().then((assignments)=>{
                
                for (var i in assignments) {
                    dt = assignments[i].dateTime.trim().split(" ");
                    assignments[i].date = `${dt[1]} ${dt[2]} ${dt[3]}`
                    assignments[i].time = dt[4]
                
                  }
                  console.log(assignments);
                  resolve(assignments)
            })
        })
        
    },
    deleteAssignment:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ASSIGNMENT_COLLECTION)
            .deleteOne({_id:objectId(id)}).then(()=>{
                resolve()
            })
        })
        
    }
}