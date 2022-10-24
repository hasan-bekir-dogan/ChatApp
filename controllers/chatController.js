const Chat = require("../models/Chat");
const User = require("../models/User");
const merge = require("deepmerge");

exports.getChat = async (req, res) => {
  try {
    const senderUserId = req.session.userId;
    let senderUser = 1;

    let chat = await Chat.find()
      .populate("user1MessageId")
      .populate("user2MessageId");

    let receiveruserid, receiver, user1Messages, user2Messages;
    let chatPlain = [{}];

    // parsed to add new column
    chat = JSON.parse(JSON.stringify(chat));

    // specify receiver user id
    for (let i = 0; i < chat.length; i ++) {
        if (chat[i].user1Id == senderUserId) {
          receiveruserid = chat[i].user2Id;
        }
        else{
          receiveruserid = chat[i].user1Id;
        }

        user1Messages = chat[i].user1MessageId;
        user2Messages = chat[i].user2MessageId;

        // specify messages types that is sender or receiver
        if (senderUser == 1) {
          for (let i = 0; i < user1Messages.length; i++) {
            user1Messages[i].userType = "sender";
          }
          for (let i = 0; i < user2Messages.length; i++) {
            user2Messages[i].userType = "receiver";
          }
        } else {
          for (let i = 0; i < user1Messages.length; i++) {
            user1Messages[i].userType = "receiver";
          }
          for (let i = 0; i < user2Messages.length; i++) {
            user2Messages[i].userType = "sender";
          }
        }

        // sort by createdAt
        let messages = merge(user1Messages, user2Messages);
        messages.sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });

        receiver = await User.findById(receiveruserid);

        chatPlain[i].userId = receiveruserid;
        chatPlain[i].type = messages[messages.length - 1].userType;
        chatPlain[i].name = receiver.name;
        chatPlain[i].date = messages[messages.length - 1].createdAt;
        chatPlain[i].lastMessage = messages[messages.length - 1].text;
    }

    res.status(200).json({
      data: {
        chat: chatPlain,
      },
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      error,
      status: "fail",
    });
  }
};

exports.getChatDetail = async (req, res) => {
  try {
    const senderUserId = req.session.userId;

    let senderUser = 1;
    let chat = await Chat.findOne({
      // if user 1 is sender
      user1Id: senderUserId,
      user2Id: req.body.receiverUserId,
    })
      .populate("user1MessageId")
      .populate("user2MessageId");

    if (!chat) {
      senderUser = 2;
      chat = await Chat.findOne({
        // if user 2 is sender
        user2Id: senderUserId,
        user1Id: req.body.receiverUserId,
      })
        .populate("user1MessageId")
        .populate("user2MessageId");
    }

    // parsed to add new column
    const user1Messages = JSON.parse(JSON.stringify(chat.user1MessageId));
    const user2Messages = JSON.parse(JSON.stringify(chat.user2MessageId));

    // specify messages types that is sender or receiver
    if (senderUser == 1) {
      for (let i = 0; i < user1Messages.length; i++) {
        user1Messages[i].usertype = "sender";
      }
      for (let i = 0; i < user2Messages.length; i++) {
        user2Messages[i].usertype = "receiver";
      }
    } else {
      for (let i = 0; i < user1Messages.length; i++) {
        user1Messages[i].usertype = "receiver";
      }
      for (let i = 0; i < user2Messages.length; i++) {
        user2Messages[i].usertype = "sender";
      }
    }

    // sort by createdAt
    let messages = merge(user1Messages, user2Messages);
    messages.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.status(200).json({
      data: {
        messages,
      },
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      error,
      status: "fail",
    });
  }
};