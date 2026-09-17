const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");
const { asObjectId, asString } = require("../utils/query");

exports.sendMessage = async (req, res, next) => {
  try {
    const senderUserId = req.user._id;
    const receiverUserId = asObjectId(req.body.receiverUserId);
    const text = asString(req.body.text);

    if (!receiverUserId) {
      return res.status(400).json({
        status: "fail",
        message: "A valid receiver id is required.",
      });
    }

    if (!text) {
      return res.status(400).json({
        status: "fail",
        message: "Message text cannot be empty.",
      });
    }

    const receiverUser = await User.findById(receiverUserId);

    if (!receiverUser) {
      return res.status(404).json({ status: "fail", message: "User not found." });
    }

    const message = await Message.create({ text });
    const chat = await Chat.findBetween(senderUserId, receiverUserId);

    if (!chat) {
      await Chat.create({
        user1Id: senderUserId,
        user1MessageId: [message._id],
        user2Id: receiverUserId,
      });
    } else {
      const senderIsUser1 = String(chat.user1Id) === String(senderUserId);
      const bucket = senderIsUser1 ? chat.user1MessageId : chat.user2MessageId;

      bucket.push(message._id);
      await chat.save();
    }

    res.status(201).json({
      data: {
        messageId: message._id,
        messageDate: message.createdAt,
        receiverUserName: receiverUser.name,
        receiverUserImage: receiverUser.image,
      },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const senderUserId = req.user._id;
    const receiverUserId = asObjectId(req.body.receiverUserId);
    const messageId = asObjectId(req.body.messageId);

    if (!receiverUserId || !messageId) {
      return res.status(400).json({
        status: "fail",
        message: "A valid receiver id and message id are required.",
      });
    }

    const chat = await Chat.findBetween(senderUserId, receiverUserId);

    if (!chat) {
      return res.status(404).json({ status: "fail", message: "Chat not found." });
    }

    // Only the author of a message may delete it, and only from a chat they
    // take part in. Without this check any signed-in user could delete any
    // message by guessing its id.
    const senderIsUser1 = String(chat.user1Id) === String(senderUserId);
    const ownMessages = senderIsUser1 ? chat.user1MessageId : chat.user2MessageId;
    const owned = ownMessages.some((id) => String(id) === messageId);

    if (!owned) {
      return res.status(403).json({
        status: "fail",
        message: "You can only delete your own messages.",
      });
    }

    ownMessages.pull(messageId);
    await chat.save();
    await Message.findByIdAndDelete(messageId);

    // A conversation with no messages left is removed as well, so it stops
    // showing up in the chat list.
    const isEmpty =
      chat.user1MessageId.length === 0 && chat.user2MessageId.length === 0;

    if (isEmpty) {
      await Chat.findByIdAndDelete(chat._id);
    }

    res.status(200).json({
      checkChatEmpty: isEmpty,
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};
