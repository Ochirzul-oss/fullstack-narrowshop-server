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
    weight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weight',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
    },
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
