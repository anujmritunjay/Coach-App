const validator = require('validator');
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
// const {cryptoRandomString}s = require('crypto-random-string')



const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        unique: true,
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    phoneNumber:{
        type: String,
        required: [true, 'Please provide a Phone number']
    },
    isAccountVerifed: {
        type: Boolean,
        default: false,
    },

    accountVerificationToken: {
        type: String, 
        default: null
    },
    forgotPasswordToken: {
        type: String, 
        default: null
    }
},{ versionKey: false })


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next()
  });
userSchema.methods.correctPassword = async function(userPassword, inputPassword){
    return await bcrypt.compare(userPassword, inputPassword);
}

userSchema.methods.accountVerifactionToken = async function() {
    var uniqid = require('uniqid'); 
    const token = uniqid()
    this.accountVerificationToken = token
    return token;

  };

const User = mongoose.model('User', userSchema)
module.exports = User