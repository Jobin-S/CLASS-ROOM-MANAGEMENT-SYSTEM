const bcrypt = require('bcrypt')
const { response } = require('../app')
const db = require('../config/database')
const objectId = require('mongodb').ObjectID

module.exports = {
    doLogin:(details)=>{
       return new Promise(async(resolve, reject) => {
           let response = {}
           var user = await db.get().collection('tutor').findOne({email:details.username})
           
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
        
    }
}