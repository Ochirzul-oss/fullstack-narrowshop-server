const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema({
    lastname:{
        type:String,
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    phone:{
        type:String,
    },
    phone1:{
        type:String,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
    },
    regisnumber:{
        type:String,
    },
    sex:{
        type:String,
    },
    branch:{
        type:String,
    },
    job:{
        type:String,
    },
    education:{
        type:String,
    },
    description:{
        type:String,
    },
    images:[
        {
            type:String,
        }
    ],
    date: {
        type: Date,
        default: Date.now
    },
},{timeStamps:true})

teacherSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

teacherSchema.set('toJSON', {
    virtuals: true,
});

exports.Teacher = mongoose.model('Teacher', teacherSchema);
exports.teacherSchema = teacherSchema;