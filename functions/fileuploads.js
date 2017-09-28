var {config,logger} = require('./../config/default');
var db = require('./../config/dbconfig');
var request = require('request');
const csv = require('fast-csv');
const fs = require('fs');
const {ObjectID}=require('mongodb');
const _=require('lodash');
const  BulkFileDetail=require('./../models/bulkfiledetail');


var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/s3config.json');
var s3 = new AWS.S3();
var s3Bucket = new AWS.S3( { params: {Bucket: config.myAWS.Bucket} } )

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


    var filePath=`${config.myAWS.baseurl}/${config.myAWS.uploadedfiles}/${efilename}`;
console.log(filePath);

    var bulk = db.collectionEmployee().initializeUnorderedBulkOp();
    logger.info(`AWS CSV File processing please wait... ${efilename}`);

    var params = {Key: `${config.myAWS.uploadedfiles}/${efilename}`};
    
    const s3Stream =  s3Bucket.getObject(params).createReadStream()
    
    csv
    .fromStream(
        s3Stream, {headers: fileHeaders,ignoreEmpty: true})
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

        var rejectionError="SERVER REJECTED:";  

        
        if (data.email.length>0&&!validateEmail(data.email)) {
            rejectionError=rejectionError+" Valid Email Required";
            validStatus=false;
        }
        if(data._id==='null'){           
            data._id=new ObjectID();
            data.createdAt= new Date();
            if (!(data.name.length>0 && data.name.length<20)) {
                rejectionError=rejectionError+" NAME(length<20) Required";
                validStatus=false;
            }            
        }else if(!ObjectID.isValid(data._id)){
            rejectionError=rejectionError+" Not A Valid ID";
            validStatus=false;
        }else{
            data._id=new ObjectID(data._id);
        }

        var  myDataTest=_.pickBy(data);
         myDataTest=_.pick(myDataTest,['name', 'email', 'designation','short_desc','desc']);
   
         if(_.isEmpty(myDataTest)){ 
            rejectionError=rejectionError+" NO USER DATA FOUND";            
            validStatus=false;
        }

        if(validStatus===false){
            data.ERRORS=rejectionError; 
        }
        return validStatus;
        }).on("data-invalid", function(data){
            
            var rejectionError="SERVER REJECTED:";             
                       
            // if(!(data.name.length>0 && data.name.length<20)){
            // rejectionError=rejectionError+" NAME(length<20) Required";
            // }
            // if (data.email.length>0&&!validateEmail(data.email)) {
            //     rejectionError=rejectionError+" Valid Email Required";
            // }
            
            // if(!ObjectID.isValid(data._id)){
            //     rejectionError=rejectionError+" Not A Valid ID";
            // }

    //         var  myDataTest=_.pickBy(data);
    //         myDataTest=_.pick(myDataTest,['name', 'email', 'designation','short_desc','desc']);
    //    if(_.isEmpty(myDataTest)){
    //             rejectionError=rejectionError+" NO USER DATA FOUND";
    //        }
            // data.ERRORS=rejectionError; 
            errorArray.push(data);
            
        })
        .on('data', function(data) {// valid data

            data.profileimage='noimage.jpg';
            data=_.pickBy(data);

            // var myDataTest=_.pick(data,['name', 'email', 'designation','short_desc','desc']);

            // console.log("-------------",JSON.stringify(myDataTest,undefined,2));

            // if(_.isEmpty(myDataTest)){
            //     console.log("--------Ab Delete Kar Lo App-----"); 
            //     bulk.find( {_id:data._id} ).removeOne();
            // }else{
                bulk.find({_id:data._id}).upsert().updateOne({
                    $set:data,              
                    $currentDate: { updatedAt:true}            
                });
           //}         
            

            vaildArray.push(data);
        })
        .on('end', function() {  // when all completed 
       //    console.log(vaildArray);    console.log(errorArray);      console.log(totalCount);

            bulk.execute(function(error, result) {

                    let resultJSON = JSON.stringify(vaildArray, null, 2); 
                    let errorArrayJSON = JSON.stringify(errorArray, null, 2); 
          
                    var dataSuccess = {Key: `${config.myAWS.successfiles}/${efilename}.json`, acl: 'public-read',Body:resultJSON};
                    var dataReject = {Key: `${config.myAWS.errorfiles}/${efilename}.json`, acl: 'public-read',Body:errorArrayJSON};
                    
                    s3Bucket.upload (dataSuccess, function (err, sdata) {
                                      if (err) {
                                       logger.error(`Error in AWS Success file Uploading File...`,efilename); 
                                       logger.error(`Error in AWS Success file Uploading error details...`,err);           
                                        } 
                                        if (sdata) {
                                        logger.info(`Success file uploaded to AWS server At url ${sdata.Location}`);    
                                 }
                    });

                    s3Bucket.upload (dataReject, function (err, rdata) {
                        if (err) {
                         logger.error(`Error in AWS Rejected file Uploading File...`,efilename); 
                         logger.error(`Error in AWS Rejected file Uploading error details...`,err);           
                          } 
                          if (rdata) {
                          logger.info(`Rejected file uploaded to AWS server At url ${rdata.Location}`);    
                   }
                    });                  
          
                    var details={      
                        successrecords:result.nUpserted,
                        updatedrecords:result.nModified,  
                        removedrecords:result.nRemoved,   
                        nMatchedRecords:result.nMatched,               
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