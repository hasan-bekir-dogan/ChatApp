const User = require("../models/User");
const { asObjectId, asString } = require("../utils/query");

function serializeContacts(user) {
  return user.phoneBook.map((contact) => ({
    _id: contact._id,
    name: contact.name,
    email: contact.email,
    image: contact.image,
  }));
}

exports.createPerson = async (req, res, next) => {
  try {
    const email = asString(req.body.email).toLowerCase();

    if (!email) {
      return res.status(422).json({
        errorMessages: [{ message: "E-mail must have some value." }],
        status: "validation",
      });
    }

    const person = await User.findOne({ email });

    if (!person) {
      return res.status(422).json({
        errorMessages: [{ message: "User does not exist." }],
        status: "validation",
      });
    }

    if (String(person._id) === String(req.user._id)) {
      return res.status(422).json({
        errorMessages: [{ message: "You cannot add yourself." }],
        status: "validation",
      });
    }

    const user = await User.findById(req.user._id);
    const alreadyAdded = user.phoneBook.some(
      (contactId) => String(contactId) === String(person._id)
    );

    if (alreadyAdded) {
      return res.status(422).json({
        errorMessages: [{ message: "User is already added." }],
        status: "validation",
      });
    }

    user.phoneBook.push(person._id);
    await user.save();
    await user.populate("phoneBook");

    res.status(201).json({
      data: { contacts: serializeContacts(user) },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.listPerson = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("phoneBook");

    res.status(200).json({
      data: { contacts: serializeContacts(user) },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePerson = async (req, res, next) => {
  try {
    const contactId = asObjectId(req.body.userId);

    if (!contactId) {
      return res.status(400).json({
        status: "fail",
        message: "A valid contact id is required.",
      });
    }

    const user = await User.findById(req.user._id);

    user.phoneBook.pull(contactId);
    await user.save();

    res.status(200).json({ status: "success" });
  } catch (error) {
    next(error);
  }
};
