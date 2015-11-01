var mongoose = require('mongoose');
var schema = mongoose.Schema;

//schema for users
var userSchema = new schema({
    name: String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    meta: {
        age: Number,
        email: String
    },
    created_at: Date,
    updated_at: Date
});
//[TODO]custom method to hash password
//[TODO]custom method to check uniqueness of username

//make a model out of the schema
var User = mongoose.model('User',userSchema);
module.exports = User;