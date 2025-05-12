const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    price: {
        type: Number,
        default: 0
    },
    catName:{
        type:String,
        default:''
    },
    catId:{
        type:String,
        default:''
    },
    conMinute:{
    type: String,
    default: 0
    },
    timesOfLesson:{
        type: String,
        default: 0
    },
    lessonType:{
        type: String,
        default: ''
    },
    groupen:{
        type: String,
        default: ''
    },
    lessonDays: [
        {
            type: String,
            default: null,
        }
    ],
    maxiStudents:{
        type: String,
        default: 0
    },
    subCatId:{
        type:String,
        default:''
    },
    subCat:{
        type:String,
        default:''
    },
    subCatName:{
        type:String,
        default:''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
        }
    ],
    productRam: [
        {
            type: String,
            default: null,
        }
    ],
    size: [
        {
            type: String,
            default: null,
        }
    ],
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})


lessonSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

lessonSchema.set('toJSON', {
    virtuals: true,
});

exports.Lesson = mongoose.model('Lesson', lessonSchema);
