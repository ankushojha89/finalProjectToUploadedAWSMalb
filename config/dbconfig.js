
var {config,logger} = require('./default');

const MongoClient = require('mongodb').MongoClient;


/**************************************************************/
/** * Database setup */
/**************************************************************/

//var db=null;

var state = {
  db: null,
  employee:null,
  BulkFileDetail:null
}
var options ={ 
    reconnectTries: 30,
    poolSize: 5   
}


// database details pooling
//mongodb://<dbuser>:<dbpassword>@ds147034.mlab.com:47034/employeedb
if(config.database.mLab==true){
  process.env.MONGODB_URI=`${config.database.dbType}://${config.database.mLabDbUserName}:${config.database.mLabDbPassword}@${config.database.mLabHost}:${config.database.mLabPort}/${config.database.mLabDBName}`;
  
}else if(process.env.NODE_ENV==='devlopment'){  
  process.env.MONGODB_URI=`${config.database.dbType}://${config.database.dbHost}:${config.database.dbPort}/${config.database.dbName}`;
}else{
  process.env.MONGODB_URI=`${config.database.dbType}://${config.database.dbHost}:${config.database.dbPort}/${config.database.dbName}`;
}

exports.connect = function(done) {
  if (state.db) return done()
  MongoClient.connect(process.env.MONGODB_URI,options, function(err, db) {
    if(err) {     
      logger.error(`Mongodb connection error on ${process.env.MONGODB_URI}`);
      logger.error(err);         
      process.exit(0); 
    }
    logger.info(`Successfully connected to the database ${process.env.MONGODB_URI}`);
    state.db = db;
    state.employee = db.collection(config.database.tableName);
    state.BulkFileDetail = db.collection(config.database.bulktableName);
    done()
  })
}

exports.get = function() {
 return state.db;
}

exports.collectionEmployee = function() {
  return state.employee;
 }

 exports.collectionBulkFile = function() {
  return state.BulkFileDetail;
 }

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      logger.info(`Successfully connection closed to the database ${process.env.MONGODB_URI}`);
      state.db = null
      state.mode = null  
      state.employee = null    
    })
  }
}
