const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessageSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
