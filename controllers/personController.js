const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.createPerson = async (req, res) => {
  try {
    const person = await User.findOne({
      email: req.body.email,
    }).then(async (person) => {
      if (person) {
        const user = await User.findById(req.session.userId);
        await user.phoneBook.push({
          _id: person._id,
        });
        await user.save();
      }
    });

    const contacts = await User.findById(req.session.userId).populate(
      "phoneBook"
    );

    res.status(201).json({
      data: {
        contacts: contacts.phoneBook,
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

exports.listPerson = async (req, res) => {
  try {
    const contacts = await User.findById(req.session.userId).populate("phoneBook");

    res.status(200).json({
        data: {
          contacts: contacts.phoneBook,
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

exports.deletePerson = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
    await user.phoneBook.pull({_id: req.body.userId})
    await user.save()

    res.status(200).json({
      status: 'success'
    })
  } catch (error) {
    res.status(400).json({
      error,
      status: 'fail'
    })
  }
}