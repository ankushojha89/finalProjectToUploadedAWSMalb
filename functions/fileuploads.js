var {logger} = require('./../config/default');
var db = require('./../config/dbconfig');

const csv = require('fast-csv');
const fs = require('fs');
const {ObjectID}=require('mongodb');
const _=require('lodash');


const  BulkFileDetail=require('./../models/bulkfiledetail');


var fileHeaders= ['_id','name', 'email', 'designation','short_desc','desc'];

/**
 * 
 * @param email 
 */
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

csvUploads =(efilename,fileDBId)=>{
    logger.info(''+fileDBId);
    var totalCount=0, vaildArray = [], errorArray = [];
    var filePath=process.env.PROJECT_ROOT+ `/public/files/bulkuploads/${efilename}`;
    var bulk = db.collectionEmployee().initializeUnorderedBulkOp();

    logger.info(`CSV File processing working... ${efilename}`);  
    csv
    .fromPath(filePath, {headers: fileHeaders,ignoreEmpty: true})
    .validate((data)=>{
        var validStatus =true;
            totalCount++;   
        //trim data
        data._id=data._id.trim();
        data.name=data.name.trim();
        data.email=data.email.trim();
        data.designation=data.designation.trim();
        data.short_desc=data.short_desc.trim();
        data.desc=data.desc.trim();

        if(data._id==='null'){           
            data._id=new ObjectID();
            data.createdAt= new Date();
            if (!validateEmail(data.email)||!(data.name.length>0 && data.name.length<20)) {
                validStatus=false;
            }
        }else if(!ObjectID.isValid(data._id)){
            validStatus=false;
        }else{
            data._id=new ObjectID(data._id);
        }
        return validStatus;
        }).on("data-invalid", function(data){
            
            var rejectionError="SERVER REJECTED:";            
            if(!(data.name.length>0 && data.name.length<20)){
            rejectionError=rejectionError+" NAME(length<20) Required";
            }
            if(!validateEmail(data.email)){
                rejectionError=rejectionError+" Valid Email Required";
            }
            if(!ObjectID.isValid(data._id)){
                rejectionError=rejectionError+" Not A Valid ID";
            }

            data.ERRORS=rejectionError; 
            errorArray.push(data);
            
        })
        .on('data', function(data) {// valid data

            data.profileimage='noimage.jpg';
            data=_.pickBy(data);
            
            bulk.find({_id:data._id}).upsert().updateOne({
                $set:data,              
                $currentDate: { updatedAt:true}            
            });


            vaildArray.push(data);
        })
        .on('end', function() {  // when all completed 
     //       console.log(vaildArray);    console.log(errorArray);      console.log(totalCount);

            bulk.execute(function(error, result) {
                let resultJSON = JSON.stringify(vaildArray, null, 2); 
                    let errorArrayJSON = JSON.stringify(errorArray, null, 2); 
                    fs.writeFileSync(process.env.PROJECT_ROOT+ `/public/files/bulkuploadsrejected/${efilename}.json`, errorArrayJSON);  
                    fs.writeFileSync(process.env.PROJECT_ROOT+ `/public/files/bulkuploadssuccess/${efilename}.json`, resultJSON);

                    var details={
                        successrecords:result.nUpserted,
                        updatedrecords:result.nModified,
                        totalrecords:totalCount,
                        errorrecords:errorArray.length,
                        errorfile:efilename+'.json',
                        successfile:efilename+'.json',
                        status:'Completed',
                        updatedAt:new Date()
                    };

                if(error){ 
                    details.status='Updation error'
                    logger.error(`CSV File error in database updation... ${efilename}`);  
                    error.message=`CSV File error in database updation... ${efilename}`;                    
                }
                
                BulkFileDetail.Update(fileDBId,details,(err,docs)=>{
                    if(err){ 
                        details.status='FInal Updation error '
                        logger.error(`CSV File error in Final database updation... ${efilename}`);  
                        error.message=`CSV File error in Final database updation... ${efilename}`;                    
                    }
                    else{
                        logger.info(`CSV File processed... ${efilename}`);  
                    }
                });
                               
            });  
            
                
        });
}
module.exports = {csvUploads};