var {config,logger,express} = require('./../../config/default');

var  Employee=require('./../../models/employee');
var router=express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {     
    logger.info(`${req.ip} GET admin home page request `);         
    res.render('admin/index', { title: 'Welcome to Admin Area' });  

});

/* GET add new employee page. */
router.get('/add', function(req, res, next) {     
    logger.info(`${req.ip} GET add new employee page request `);         
    res.render('admin/add', { title: 'Add New Employee Admin Area' });  
});

/* GET edit employee page. */
router.get('/edit/:id', function(req, res, next) {     
    logger.info(`${req.ip} GET edit employee page request `);         
    res.render('admin/edit', { title: 'Edit Employee Admin Area' });  
});



module.exports=router;