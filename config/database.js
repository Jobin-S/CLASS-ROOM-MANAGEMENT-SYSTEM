const mongoClient = require('mongodb').MongoClient

const state ={
    db:null
}

module.exports.connect = ()=>{
    return new Promise((resolve, reject) => {
        const url = 'mongodb://localhost:27017';
        const dbName = 'classroom';

        mongoClient.connect(url,{ useUnifiedTopology: true }, (err, data)=>{
        if (err) resolve(err)
        state.db = data.db(dbName)
        resolve()
        })
    })
    
}

module.exports.get=()=>{
    return state.db
}