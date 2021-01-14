const db = require('../config/database')
const collection = require('../config/collection')
const { post, removeListener } = require('../app')
const objectId = require('mongodb').ObjectID
require('dotenv').config()
var unirest = require('unirest');
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const { ObjectID, ObjectId } = require('mongodb')

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
      let dt = Date(Date.now()).trim().split(" ");
        let date = dt[2]
        let month = dt[1]
        let year = dt[3]
      if(noteSeened){
        reject()
      }else{
        db.get().collection(collection.STUDENT_COLLECTION)
          .updateOne(
            {_id:objectId(studentId)},
            {
              $push:{notes:{
              dateTime:Date(Date.now()),
              date:date,
              month:month,
              year:year,
              noteId:noteId
            }}
          }).then(()=>{
            resolve()
          })
      }
          
        }
        )
  },
  verifyAttendance:(userId)=>{
    return new Promise(async(resolve, reject) => {
      let dt = new Date()
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let date = dt.getDate().toString()
        let month = monthNames[dt.getMonth()]
        let year = dt.getFullYear().toString()
        let dateDashboard = date + " " + month + " " +year
      let student = await db.get().collection(collection.STUDENT_COLLECTION).aggregate([
        {$match:{'_id':ObjectId(userId), 'notes.date':'14', 'notes.month':"Jan", 'notes.year':"2021"}}
      ]).toArray()
      console.log(student);
        console.log("student: "+student[0]);

        if(student){
          console.log('present: '+student);

          resolve({attendance:true, date :dateDashboard})
        }else if(!student){
          console.log('absent: '+student);

          resolve({attendance:false, date :dateDashboard})


        }
      
    })
    
  },
  getAnnouncements:()=>{
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ANNOUNCEMENT_COLLECTION)
        .find().toArray().then((announcements)=>{
            for(var i in announcements){
                let date = announcements[i].dateTime.getDate()
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                let month = monthNames[announcements[i].dateTime.getMonth()]
                let year = announcements[i].dateTime.getFullYear()
                announcements[i].date = date + " " + month + ' ' + year

                console.log(date,month, year);
            }
            
            resolve(announcements.reverse())
        })
    })
    
},
getSingleAnnouncement:(id)=>{
  return new Promise((resolve, reject) => {
    db.get().collection(collection.ANNOUNCEMENT_COLLECTION)
  .findOne({_id:ObjectID(id)}).then((announcement)=>{
    resolve(announcement)
  })
  })
  
},
getEvents:()=>{
  return new Promise((resolve, reject) => {
      db.get().collection(collection.EVENT_COLLECTION)
      .find().toArray().then((events)=>{
          for(var i in events){
              let date = events[i].dateTime.getDate()
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              let month = monthNames[events[i].dateTime.getMonth()]
              let year = events[i].dateTime.getFullYear()
              events[i].date = date + " " + month + ' ' + year

              console.log(date,month, year);
          }
          
          resolve(events.reverse())
      })
  })
  
},
getSingleEvent:(id)=>{
  return new Promise((resolve, reject) => {
    db.get().collection(collection.EVENT_COLLECTION)
  .findOne({_id:ObjectId(id)}).then((event)=>{
    resolve(event)
  })
  })
  
},
VerifyEventPurchase:(studentId, eventId)=>{
  return new Promise(async(resolve, reject) => {
    let orders = await db.get().collection(collection.ORDER_COLLECTION)
    .aggregate([
      {$match:{'studentId':objectId(studentId), 'eventId':eventId}}
    ]).toArray()
    console.log(orders);
    var i;
    let status = false
    for (i in orders){
      if(orders[i].isPaid === true) status = true
    }
    console.log(status);
    if(status){
      resolve(orders[0])
    }else{
      resolve(false)
    }
    
  })
  
},
getAllGalleryItems:()=>{
    return new Promise(async(resolve, reject) => {
        let items = await db.get().collection(collection.GALLERY_COLLECTION).find({}).toArray()
        console.log(items);
        resolve(items.reverse())
    })
    
}
}
