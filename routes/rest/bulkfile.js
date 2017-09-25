var {config,logger,express} = require('./../../config/default');
var router=express.Router();
const  Employee=require('./../../models/employee');
const  BulkFileDetail=require('./../../models/bulkfiledetail');
const {ObjectID}=require('mongodb');
const multer=require('multer');
var csvupload=multer({dest:'./public/files/bulkuploads'});
const _=require('lodash');
/**
 * uploads functions 
 */
var {csvUploads}=require('./../../functions/fileuploads');

/**
 * Bulk file for view
 */

router.get('/uploads', function(req, res, next) {
    logger.info(`${req.ip} Bulk file upload form view `); 
    res.render('bulk/index', { title: 'Upload Bulk Employee file' });
  });
  

/**
 * Bulk file upload request method
 */

/* REST GET all request */
router.get('/', function(req, res, next) {     
    logger.info(`${req.ip} REST GET all bulk file details`);      
    BulkFileDetail.all(function(err, docs) {
        if(err){
            err.message='Error in getting all bulk file list';
            err.status = 400;
            next(err);   
        }                   
        res.send({docs});
      })
});



router.post('/', csvupload.single('csvUpload') ,function(req, res, next) {
    logger.info(`${req.ip} Bulk file upload request `);   
     if(req.file){ 
        logger.info(`${req.ip} Locading... `,req.file.filename);                        
        processCsvFile(req.file.filename);
        logger.info(`${req.ip} CSV File Uploaded... `,req.file.filename);        
        return  res.status(200).send({message:`${req.file.filename} file uploaded successfully. Please check status after some time.`}); 
     }else{
        logger.info(`${req.ip} No File Found for Bulk file upload`);   
         return  res.status(400).send({message:'No File Found'}); 
     }     
 });

 function processCsvFile(filename){ 
    logger.info(`CSV File processing... ${filename}`);  
    
    var bulkFileDetail={filename,
        status:'Processing',
        errorfile:null,
        successfile:null,
        totalrecords:0,
        successrecords:0,
        errorrecords:0,
        updatedrecords:0,
        uploadedAt:new Date(),
        updatedAt:new Date()
    };
    
    BulkFileDetail.save(bulkFileDetail,(err, docs)=>{
        if(err){            
            err.message="CSV File Not Processed due error..."+filename;
            return next(err);   
        }            
        csvUploads(filename,docs._id);            
}); 



}

 module.exports=router;