const mongoose = require("mongoose");

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    phone: {
      type: String,
    },
    phone1: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
    location: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timeStamps: true }
);

branchSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

branchSchema.set("toJSON", {
  virtuals: true,
});

exports.Branch = mongoose.model("Branch", branchSchema);
exports.branchSchema = branchSchema;