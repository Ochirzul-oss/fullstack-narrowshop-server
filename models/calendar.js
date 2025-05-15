const mongoose = require("mongoose");

const calendarSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
    },
    color:{
        type: String,
    }
  },
  { timestamps: true }
);

calendarSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

calendarSchema.set("toJSON", {
  virtuals: true,
});

exports.Calendar = mongoose.model("Calendar", calendarSchema);
exports.calendarSchema = calendarSchema;