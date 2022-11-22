const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require('../models/User')


exports.sendMessage = async (req, res) => {
  try {
    const v_senderUserId = req.session.userId;
    const message = await Message.create({
      text: req.body.text,
    });

    const chat1 = await Chat.findOne({
      // this is for action when sender is user 1
      user1Id: v_senderUserId,
      user2Id: req.body.receiverUserId,
    }).then(async (chat1) => {
      if (chat1) {
        await chat1.user1MessageId.push({
          _id: message._id,
        });
        await chat1.save();
      } else {
        const chat2 = await Chat.findOne({
          // this is for action when sender is user 2
          user1Id: req.body.receiverUserId,
          user2Id: v_senderUserId,
        }).then(async (chat2) => {
          if (chat2) {
            await chat2.user2MessageId.push({
              _id: message._id,
            });
            await chat2.save();
          } else {
            await Chat.create({
              user1Id: v_senderUserId,
              user1MessageId: message._id,
              user2Id: req.body.receiverUserId,
            });
          }
        });
      }
    });

    const receiverUser = await User.findById(req.body.receiverUserId);

    res.status(201).json({
      data: {
        messageId: message._id,
        messageDate: message.createdAt,
        receiverUserName: receiverUser.name,
        receiverUserImage: receiverUser.image
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

exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const receiverUserId = req.body.receiverUserId;
    const senderUserId = req.session.userId;
    let checkChatEmpty = false;

    const chat = await Chat.findOne({
      $or: [
        {
          $and: [{ user1Id: senderUserId }, { user2Id: receiverUserId }],
        },
        {
          $and: [{ user1Id: receiverUserId }, { user2Id: senderUserId }],
        },
      ],
    });

    const chatMsgDelete = await Chat.findById(chat._id);
    await chatMsgDelete.user1MessageId.pull({ _id: messageId });
    await chatMsgDelete.user2MessageId.pull({ _id: messageId });
    await chatMsgDelete.save();

    await Message.findByIdAndRemove({_id: messageId})

    // delete chat if there is no message (begin)
    let checkChat = await Chat.findById(chat._id)
    .populate('user1MessageId')
    .populate('user2MessageId');

    if(checkChat.user1MessageId[0] == null && checkChat.user2MessageId[0] == null) {
      await Chat.findByIdAndRemove({_id: chat._id})
      checkChatEmpty = true;
    }
    // delete chat if there is no message (end)


    res.status(200).json({
      checkChatEmpty,
      status: "success"
    });
  } catch (error) {
    res.status(400).json({
      error,
      status: "fail",
    });
  }
};

