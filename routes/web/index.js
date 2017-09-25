
var {config,logger,express} = require('./../../config/default');


var router=express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    logger.info(`${req.ip} GET web home page request `);  
    res.render('web/index', { title: 'Welcome to Employee Database' });
});


module.exports = router;