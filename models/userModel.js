const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already in use."],
      match:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePic: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[789]\d{9}$/, "Please enter a valid Indian phone number"],
    },
    otp: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // New field to track total product rejections
    totalProductRejections: {
      type: Number,
      default: 0,
    },
    // New field to track rejection threshold
    rejectionThreshold: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field to reference addresses
userSchema.virtual("addresses", {
  ref: "Address",
  localField: "_id",
  foreignField: "user",
  justOne: false,
  options: { lean: true },
});

module.exports = mongoose.model("User", userSchema);
