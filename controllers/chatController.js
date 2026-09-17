const Chat = require("../models/Chat");
const User = require("../models/User");
const { asObjectId, escapeRegExp } = require("../utils/query");

function idOf(value) {
  if (!value) return null;

  return String(value._id || value);
}

/**
 * Merges the two message arrays of a conversation into one timeline and tags
 * each message with the role it has for the requesting user.
 */
function buildTimeline(chat, currentUserId) {
  const currentIsUser1 = idOf(chat.user1Id) === String(currentUserId);
  const sent = currentIsUser1 ? chat.user1MessageId : chat.user2MessageId;
  const received = currentIsUser1 ? chat.user2MessageId : chat.user1MessageId;

  return [
    ...sent.map((message) => ({ ...message, userType: "sender" })),
    ...received.map((message) => ({ ...message, userType: "receiver" })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function toChatListItem(chat, currentUserId) {
  const timeline = buildTimeline(chat, currentUserId);

  // A conversation whose last message was deleted has nothing to preview.
  if (timeline.length === 0) return null;

  const currentIsUser1 = idOf(chat.user1Id) === String(currentUserId);
  const receiverId = currentIsUser1 ? idOf(chat.user2Id) : idOf(chat.user1Id);
  const receiver = await User.findById(receiverId);

  if (!receiver) return null;

  const lastMessage = timeline[timeline.length - 1];

  return {
    userId: receiverId,
    image: receiver.image,
    type: lastMessage.userType,
    name: receiver.name,
    date: lastMessage.createdAt,
    lastMessage: lastMessage.text,
  };
}

exports.getChat = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Chat.find({
      $or: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
    })
      .populate("user1MessageId")
      .populate("user2MessageId")
      .lean();

    const items = await Promise.all(
      chats.map((chat) => toChatListItem(chat, currentUserId))
    );

    res.status(200).json({
      data: { chat: items.filter(Boolean) },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.getChatDetail = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const receiverUserId = asObjectId(req.body.receiverUserId);

    if (!receiverUserId) {
      return res.status(400).json({
        status: "fail",
        message: "A valid receiver id is required.",
      });
    }

    const receiver = await User.findById(receiverUserId);

    if (!receiver) {
      return res.status(404).json({ status: "fail", message: "User not found." });
    }

    const chat = await Chat.findBetween(currentUserId, receiverUserId)
      .populate("user1MessageId")
      .populate("user2MessageId")
      .lean();

    res.status(200).json({
      data: {
        messages: chat ? buildTimeline(chat, currentUserId) : [],
        receiverName: receiver.name,
        receiverEmail: receiver.email,
        receiverImage: receiver.image,
      },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.checkChatExist = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const receiverUserId = asObjectId(req.body.receiverUserId);

    if (!receiverUserId) {
      return res.status(400).json({
        status: "fail",
        message: "A valid receiver id is required.",
      });
    }

    const receiver = await User.findById(receiverUserId);

    if (!receiver) {
      return res.status(404).json({ status: "fail", message: "User not found." });
    }

    const chat = await Chat.findBetween(currentUserId, receiverUserId);

    res.status(200).json({
      data: {
        checkExist: Boolean(chat),
        receiverName: receiver.name,
        receiverEmail: receiver.email,
        receiverImage: receiver.image,
      },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.searchInChat = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const pattern = new RegExp(escapeRegExp(req.body.searchtext), "i");

    const chats = await Chat.find({
      $or: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
    })
      .populate("user1MessageId")
      .populate("user2MessageId")
      .lean();

    const matches = await Promise.all(
      chats.map(async (chat) => {
        const currentIsUser1 = idOf(chat.user1Id) === String(currentUserId);
        const receiverId = currentIsUser1 ? idOf(chat.user2Id) : idOf(chat.user1Id);
        const receiver = await User.findById(receiverId);

        if (!receiver || !pattern.test(receiver.name)) return null;

        return toChatListItem(chat, currentUserId);
      })
    );

    res.status(200).json({
      data: { chat: matches.filter(Boolean) },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};
