const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.sendMessage = async (req, res) => {
  try {
    const message = await Message.create({
      text: req.body.text,
    });

    const chat1 = await Chat.findOne({
      // this is for action when sender is user 1
      user1Id: req.body.senderUserId,
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
          user1Id: req.body.senderUserId,
          user2Id: req.body.receiverUserId,
        }).then(async (chat2) => {
          if (chat2) {
            await chat2.user2MessageId.push({
              _id: message._id,
            });
            await chat2.save();
          } else {
            await Chat.create({
              user1Id: req.body.senderUserId,
              user1MessageId: message._id,
              user2Id: req.body.receiverUserId,
            });
          }
        });
      }
    });

    res.status(201).json({
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      error,
      status: "fail",
    });
  }
};
