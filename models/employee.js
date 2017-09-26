var db = require('./../config/dbconfig');
const {ObjectID}=require('mongodb');

findById = function(id,cb) {     
    db.collectionEmployee().findOne({_id: new ObjectID(id)},function(err, result) {        
      cb(err, result);
    });
}
exports.all = function(cb) {     
    db.collectionEmployee().find().sort( { _id: -1 } ).toArray(function(err, employees) {
      cb(err, employees);
    })
}
 
exports.findById=findById;

exports.save = function(body,cb) {     
    db.collectionEmployee().insertOne(body,function (error, response) {    
        cb(error, response.ops[0]);
    });
}

exports.findByIdAndRemove = function(id,cb) {  
    findById(id,(err, employee)=>{

        if(err){          
            return cb(err, null);  
        }
        if(!employee){
            var err= new Error(`No employee found`);   
            err.status = 404;
            return cb(err, null);   
        }  
            db.collectionEmployee().removeOne({_id: new ObjectID(id)}, function(err1, obj) {         
                console.log(obj.result.n + " document(s) deleted");
                return  cb(err1, employee);   
            });
                    
});
}
  
exports.findByIdAndUpdate = function(id,body,cb) {     


db.collectionEmployee().updateOne({_id: new ObjectID(id)}, { $set: body },function(err1, newEmployee) {         
    if(err1){          
        return cb(err1, null);  
    }  

    findById(id,(err, employee)=>{
        if(err){          
            return cb(err, null);  
        }
        if(!employee){
            var err= new Error(`No employee found`);   
            err.status = 404;
            return cb(err, null);   
        }  
        return  cb(err, employee); 
                              
});

});  
}
