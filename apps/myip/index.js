var appsHelper = require('../apps-helper')(__dirname);
var router = appsHelper.router;
var matchPath = appsHelper.matchPath;

var pg = require('pg');
var connectionString = require("../shared-config.js").connectionString;
var DB_QUERY_SELECT = "SELECT ip FROM ip_addresses ORDER BY updatetime DESC LIMIT 1;";
var DB_QUERY_INSERT = "INSERT INTO ip_addresses (ip) VALUES ($1);";

router.get(matchPath, function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	pg.connect(connectionString, function(error, client, done){
		client.query(DB_QUERY_SELECT, function(err,result){
			done();			
			res.end(result.rows[0].ip);
		});
	});
});

router.put(matchPath, function(req, res, next) {
	
	var lastIpFromHeroku = (req.headers["x-forwarded-for"] || "").split(",").pop();
	var ipToSave = req.query.ip || lastIpFromHeroku;
	
	pg.connect(connectionString,function(err, client, done){
		client.query(DB_QUERY_INSERT, [ipToSave], function(err, result){
			done();
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end();
		});
	});
});
	 
module.exports = router;
