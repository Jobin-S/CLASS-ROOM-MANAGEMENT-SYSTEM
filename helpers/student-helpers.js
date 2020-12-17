const db = require('../config/database')
const collection = require('../config/collection')
const { post } = require('../app')
const objectId = require('mongodb').ObjectID
require('dotenv').config()
var unirest = require('unirest');
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

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
      
    },
    getAllAssignments:(id)=>{
      return new Promise((resolve, reject) => {
        db.get().collection(collection.ASSIGNMENT_COLLECTION)
        .find().toArray().then(async(assignments)=>{
          let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({_id:objectId(id)})
            console.log(student)
          for (var i in assignments) {
            let dt = assignments[i].dateTime.trim().split(" ");
            assignments[i].date = `${dt[1]} ${dt[2]} ${dt[3]}`
            assignments[i].time = dt[4]            
          }

          for (var i in student.assignments){
            let assignmentId = student.assignments[i].assignmentId
            for (var j in assignments){
              if(assignmentId == assignments[j]._id){
                assignments[j].submitted = true
                assignments[j].mark = student.assignments[i].mark
              }
            }
          }
          console.log(assignments);
          resolve(assignments.reverse())
          
            
        })
      })
      
    },
    getSingleAssignment:(id)=>{
      return new Promise((resolve, reject) => {
        db.get().collection(collection.ASSIGNMENT_COLLECTION)
        .findOne({_id:objectId(id)}).then((assignment)=>{
          resolve(assignment)
        })  
      })
      
    },
    otpLogin:(isVerified, phone)=>{
      return new Promise((resolve, reject) => {
        if(!isVerified) resolve({status:false})
        db.get().collection(collection.STUDENT_COLLECTION)
        .findOne({phone:phone}).then((student)=>{
          resolve(student)
        })
      })
      
    },
    submitAssignments:(details,phoneNum, fileName,  Id)=>{
      return new Promise((resolve, reject) => {
        db.get().collection(collection.STUDENT_COLLECTION)
        .updateOne(
          {phone:phoneNum},
          {
            $push:{assignments: {
              id:uuidv4(),
              assignmentId:Id,
              dateTime:Date(Date.now()),
              file:fileName,
              topic:details.topic
            }}
          }).then(()=>{
          resolve()
        })
      })
      
    },
    getAllNotes:(phone)=>{
      return new Promise((resolve, reject) => {
          db.get().collection(collection.NOTE_COLLECTION)
          .find().toArray().then(async(notes)=>{
              for (var i in notes) {
                  let dt = notes[i].dateTime.trim().split(" ");
                  notes[i].date = `${dt[1]} ${dt[2]} ${dt[3]}`
                  notes[i].time = dt[4]
                }
              let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({phone:phone})
              console.log(student);

              console.log(notes);

                for(var i in student.notes){
                  let studentNoteId = student.notes[i].noteId
                  for (var j in notes){
                    if(notes[j]._id  == studentNoteId){
                      notes[j].marked = true
                    }
                  }
                }
                console.log(notes);
              resolve(notes.reverse())
          })
      })
      
  },
  getOneNote:(id)=>{
    return new Promise((resolve, reject) => {
      db.get().collection(collection.NOTE_COLLECTION)
      .findOne({_id:objectId(id)}).then((note)=>{
        let ytLink= note.youtubeLink
        note.youtubeLinkCode = ytLink.split('youtu.be/')[1]
        resolve(note)
      })
    })
    
  },
  markAttendance:(studentId, noteId)=>{
    return new Promise(async(resolve, reject) => {
      let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({_id:objectId(studentId)})
      console.log(student.notes);
      let noteSeened = student.notes.find(x => x.noteId === noteId)
      console.log(noteSeened);
      
      if(noteSeened){
        reject()
      }else{
        db.get().collection(collection.STUDENT_COLLECTION)
          .updateOne(
            {_id:objectId(studentId)},
            {
              $push:{notes:{
              dateTime:Date(Date.now()),
              noteId:noteId
            }}
          }).then(()=>{
            resolve()
          })
      }
          
        }
)}
}
