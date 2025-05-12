const mongoose = require("mongoose");

const bachelorPriceSchema = mongoose.Schema({
    year: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    }
});

bachelorPriceSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

bachelorPriceSchema.set('toJSON', {
    virtuals: true,
});

exports.BachelorPrice = mongoose.model('BachelorPrice', bachelorPriceSchema);