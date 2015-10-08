var express = require("express");
var app = express();
var requestHandlers = require("./requestHandlers");

var http = require("http"),
    mongodb = require('mongodb'),
    url = require("url");
var args = process.argv.slice(2);    
var uri = "mongodb://"+args[0]+":"+args[1]+"@ds029224.mongolab.com:29224/newstore";

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

//...
    app.use(allowCrossDomain);



mongodb.MongoClient.connect(uri, function(err, db) {
    if (err) {
        console.log(err.message);
        throw err;
    }
    else {
        console.log('connected to mongodb');
        var pictures = db.collection('mongodbphotostore');

        app.get('/', function(req, res) {
            requestHandlers.start(req, res, pictures);
        });
        app.get('/showAll',function(req,res){
            requestHandlers.showAll(req,res,pictures);
        });
        app.post('/upload',function(req, res) {
            requestHandlers.upload(req,res,pictures);  
        });
        app.listen(8080, function() {
            console.log("server has started listening on port 8080");
        });

    }
});
