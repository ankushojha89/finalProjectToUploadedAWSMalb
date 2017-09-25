
var {config,logger,express} = require('./config/default');

var db = require('./config/dbconfig');

const path=require('path');
const bodyParser=require('body-parser');
const exphbs=require('express-handlebars');
const expressValidator=require('express-validator');

const helmet = require('helmet');// for security purpose

// routes file
var web=require('./routes/web/index');
var admin=require('./routes/admin/admin');
var rest=require('./routes/rest/rest');
var bulk=require('./routes/rest/bulkfile');

var app = express();// initialize express

process.env.PROJECT_ROOT=__dirname;// project root setup for uploads

app.set('port', process.env.PORT||config.server.serverPort);// port setup


// security setup
app.use(helmet());

/**
 * Parse incoming request bodies in a middleware before your handlers, 
 * available under the req.body property.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

 // Express-validator
 app.use(expressValidator({
   errorFormatter: function(param, msg, value) {
       var   namespace = param.split('.'),
             root      = namespace.shift(),
             formParam = root;

     while(namespace.length) {
       formParam += '[' + namespace.shift() + ']';
     }
     return {
       param : formParam,
       msg   : msg,
       value : value
     };
   }
 }));



// public folder
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');



// routes setup
app.use('/', web);
app.use('/admin', admin);
app.use('/rest', rest);
app.use('/bulkfile', bulk);


// stop fake get request
app.get('*', function(req, res, next) {
    var err = new Error(`The requested(${req.url}) resource couldn\'t be found`);
    err.status = 404;   
    throw err;
});

// error handler
app.use( (err, req, res, next)=> {	
    logger.error(err);  
    err.message = err.message || 'Internal Server Error';  
    res.status(err.status || 500).json({message:err.message,status:err.status});    
});




// Connect to Mongo on start
db.connect(function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
    // start web server
app.listen(app.get('port'),()=>{
  logger.info(`Server start listening at port ${app.get('port')}`);
});

  }
})