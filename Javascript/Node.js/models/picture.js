var mongoose = require('mongoose');
var schema = mongoose.Schema;

//define a schema for pictures
var pictureSchema = new schema({
    picID: String,
    username: String,
    link: String,
    comments: [{
        username: String,
        content: String
    }],
    likes: [{
        username: String
    }]
});

//make a model out of the schema
var Picture = mongoose.model('Picture',pictureSchema);
module.exports = Picture;