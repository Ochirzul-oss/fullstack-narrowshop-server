const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
    },
    lastname:{
        type:String,
        required:true
    },

    regisnumber:{
        type:String,
        required:true
    },
    works:{
        type:String,
    },
    contry:{
        type:String,
    },
    goal:{
        type:String,
    },
    sex:{
        type:String,
    },
    district:{
        type:String,
        
    },
    education:{
        type:String,
    },
    course:{
        type:String,
    },
    street:{
        type:String,
    },
    job:{
        type:String,
    },
    number1:{
        type:String,
    },
    images:[
        {
            type:String,
            required:true
        }
    ],
    isAdmin:{
        type: Boolean,
        default: false,
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String
    },
    otpExpires:{
        type:Date
    },
    date: {
        type: Date,
        default: Date.now
    },
},{timeStamps:true})

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
