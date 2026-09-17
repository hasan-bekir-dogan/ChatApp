const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChatSchema = new Schema({
  user1Id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user1MessageId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  user2Id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2MessageId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Every read looks a conversation up by its two participants.
ChatSchema.index({ user1Id: 1, user2Id: 1 });

/**
 * Returns the conversation between two users regardless of which one of them
 * happens to be stored as user1.
 */
ChatSchema.statics.findBetween = function findBetween(userIdA, userIdB) {
  return this.findOne({
    $or: [
      { user1Id: userIdA, user2Id: userIdB },
      { user1Id: userIdB, user2Id: userIdA },
    ],
  });
};

module.exports = mongoose.model("Chat", ChatSchema);
