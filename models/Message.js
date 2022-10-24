const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { use } = require("../routes/pageRoute");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  text: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
