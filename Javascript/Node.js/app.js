//var express = require("express");
var express = require('express')
var app = express(); //express();
var https = require('https');
var fs = require('fs');
var passport = require('passport');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var formidable = require("formidable");
var jwt = require('jsonwebtoken');
var requestHandlers = require('./requestHandlers');
var User = require('./models/user.js');
var Picture = require('./models/picture.js');
/*
var server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
});
*/
var args = process.argv.slice(2);
var uri = "mongodb://" + args[0] + ":" + args[1] + "@ds029224.mongolab.com:29224/newstore";

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-access-token');

    next();
};

app.use(allowCrossDomain);
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//connect to db
mongoose.connect(uri);

//ROUTES
//==============================================================================
var router = express.Router();
router.get('/', function(req, res) {
    res.json({
        message: 'login prompt'
    });
});

router.route('/register')
    .post(function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (!username || !password) {
            res.json({
                message: 'username or password missing!'
            });
        }
        else {
            var newUser = new User({
                username: username,
                password: password
            });
            newUser.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'User ' + username + ' created'
                });
            });
        }
    });

router.post('/authenticate', function(req, res) {
    //find user and check credentials
    User.findOne({
        username: req.body.username
    }, function(err, user) {
        if (err) {
            res.send(err);
            throw err;
        }
        if (!user) {
            //user not found
            res.json({
                success: false,
                message: 'User not found'
            });
        }
        else if (user.password != req.body.password) {
            //[TODO]in future password will be hashed,think about how to handle it!
            res.json({
                success: false,
                message: 'Password Incorrect'
            });
        }
        else {
            //credentials are correct, create and send token
            //[TODO]Encrypt username before creating token
            var token = jwt.sign({
                username: user.name
            }, args[2], {
                expiresIn: 3600 //expires in one hour
            });
            res.json({
                success: true,
                message: 'Token granted',
                token: token
            });
        }

    })
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
router.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
    if (req.method === 'OPTIONS') {
      next();   
    }
    // decode token
    else if (token) {
        // verifies secret and checks exp
        jwt.verify(token, args[2], function(err, decoded) {
            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            }
            else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.route('/pictures')
    .post(function(req, res) {
        var form = new formidable.IncomingForm({
            uploadDir: '/home/ubuntu/workspace/images'
        });
        form.parse(req, function(error, fields, files) {
            if (error) {
                res.writeHead(500, {});
                res.end();
                throw error;
            }
            var picture = new Picture();
            var path = files.file.path;
            var i = path.lastIndexOf('/');
            if (fields.username)
                picture.username = fields.username;
            else
                picture.username = 'admin';
            console.log(req.body);
            picture.picID = path.slice(i + 1, path.length);
            picture.link = 'https://cloudalbum-vwalia.c9.io/images/' + path.slice(i, path.length);
            picture.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    success: true,
                    message: '',
                    data: picture
                });
            });
        });
    });
/*
    //get all pictures
    .get(function(req, res) {
        var username = req.body.user;
        if (!req.body.user) username = 'admin';
        Picture.find({
            username: username
        }, function(err, pictures) {
            if (err) res.json({});
            res.json(pictures);
        });
    });*/

router.route('/pictures/:picID')
    .get(function(req, res) {
        //get single picture
        Picture.find({
            picID: req.params.picID
        }, function(err, picture) {
            if (err)
                res.send(err);
            res.json({
                success: true,
                message: '',
                data: picture
            });
        });
    })
    .delete(function(req, res) {
        //delete a picture
        Picture.remove({
            picID: req.params.picID
        }, function(err, picture) {
            if (err)
                res.send(err);
            res.json({
                success: true,
                message: 'Deleted',
            });
        });
    });

router.route('/pictures/user/:username')
    .get(function(req, res) {
        //return all pictures for user
        //console.log(req.params.username);
        Picture.find({
            username: req.params.username
        }, function(err, pictures) {
            if (err) {
                res.send(err);
                throw err;
            }
            res.json({
                success: true,
                message: '',
                data: pictures
            });
        });
    });
app.use('/api', router);
app.listen(8081, function() {
    console.log("server has started listening on port 8081");
});
/*mongodb.MongoClient.connect(uri, function(err, db) {
    if (err) {
        console.log(err.message);
        throw err;
    }
    else {
        console.log('connected to mongodb');
        var pictures = db.collection('mongodbphotostore');
        var io = require("socket.io").listen(app.listen(8081, function() {
            console.log("server has started listening on port 8081");
        }));
        io.on('connection', function(socket) {
            socket.emit('news', {
                hello: 'world'
            });
            app.get('/', function(req, res) {
                requestHandlers.start(req, res, pictures, socket);
            });
            app.get('/showAll', function(req, res) {
                requestHandlers.showAll(req, res, pictures, socket);
            });
            app.post('/upload', function(req, res) {
                requestHandlers.upload(req, res, pictures, socket);
            });
            app.delete('/images', function(req, res) {
                requestHandlers.remove(req, res, pictures, socket);
            });
            app.get('/auth/facebook',
                passport.authenticate('facebook'));

            app.get('/auth/facebook/callback',
                passport.authenticate('facebook', {
                    failureRedirect: '/login'
                }),
                function(req, res) {
                    // Successful authentication, redirect home.
                    res.redirect('/');
                });
        });



    }
});*/
