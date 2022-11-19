const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.createPerson = async (req, res) => {
  try {
    // validation (begin)
    let errormessage = [];
    let checkVal = true;

    if (req.body.email === "") {
      errormessage.push({
        message: "E-mail must have some value.",
      });
      checkVal = false;
    }

    if (checkVal === false) {
      res.status(422).json({
        errorMessages: errormessage,
        status: "validation",
      });

      return;
    }

    await User.findOne({
      email: req.body.email,
    }).then(async (person) => {
      if (!person) {
        errormessage.push({
          message: "User does not exist.",
        });

        checkVal = false;
      }
    });

    await User.findById(req.session.userId).populate({
      path: 'phoneBook',
      match: {
        email: req.body.email
      }
    }).then(async (person) => {
      if (person.phoneBook[0]) {
        errormessage.push({
          message: "User is already added.",
        });

        checkVal = false;
      }
    })

    if (checkVal === false) {
      res.status(422).json({
        errorMessages: errormessage,
        status: "validation",
      });

      return;
    }
    // validation (end)


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
    const contacts = await User.findById(req.session.userId).populate(
      "phoneBook"
    );

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
    const user = await User.findById(req.session.userId);
    await user.phoneBook.pull({ _id: req.body.userId });
    await user.save();

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      error,
      status: "fail",
    });
  }
};
