const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { use } = require("../routes/pageRoute");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user1MessageId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user2MessageId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
