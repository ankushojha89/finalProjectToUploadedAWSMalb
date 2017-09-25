
var db = require('./../config/dbconfig');
const {ObjectID}=require('mongodb');

exports.all = function(cb) {     
    db.collectionBulkFile().find().toArray(function(err, docs) {
      cb(err, docs);
    })
}

exports.save = function(body,cb) {     
    db.collectionBulkFile().insertOne(body,function (error, response) {    
        cb(error, response.ops[0]);
    });
}


exports.Update = function(id,body,cb) {         
    
    db.collectionBulkFile().updateOne({_id:id}, { $set: body },function(err1, doc) {         
        if(err1){          
            return cb(err1, null);  
        }      
        return cb(null, doc);  
    });  
}


    