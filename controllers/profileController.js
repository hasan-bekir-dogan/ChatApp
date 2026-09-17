const fs = require("fs/promises");
const path = require("path");
const User = require("../models/User");
const env = require("../config/env");
const { asString } = require("../utils/query");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
const PUBLIC_UPLOAD_PREFIX = "/uploads/";

const ALLOWED_IMAGE_TYPES = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

function validationResponse(res, messages) {
  return res.status(422).json({
    errorMessages: messages.map((message) => ({ message })),
    status: "validation",
  });
}

/**
 * Stores an uploaded avatar under a name derived from the user id and the
 * current time. The extension comes from the detected MIME type, never from
 * the client supplied file name, so the upload cannot escape the directory or
 * land as an executable file.
 */
async function storeAvatar(userId, file) {
  const extension = ALLOWED_IMAGE_TYPES[file.mimetype];

  if (!extension) {
    const error = new Error("Only PNG, JPEG, GIF and WebP images are allowed.");
    error.status = 422;
    throw error;
  }

  if (file.size > env.uploadMaxBytes) {
    const error = new Error("The image is too large.");
    error.status = 422;
    throw error;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const fileName = `${userId}_${Date.now()}${extension}`;

  await file.mv(path.join(UPLOAD_DIR, fileName));

  return `${PUBLIC_UPLOAD_PREFIX}${fileName}`;
}

async function removeAvatar(imagePath) {
  if (!imagePath) return;

  // Older records stored the avatar as "/../uploads/<name>".
  const normalized = imagePath.replace("/../uploads/", PUBLIC_UPLOAD_PREFIX);

  if (!normalized.startsWith(PUBLIC_UPLOAD_PREFIX)) return;

  const fileName = path.basename(normalized);

  await fs.rm(path.join(UPLOAD_DIR, fileName), { force: true });
}

exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      data: {
        name: req.user.name,
        email: req.user.email,
        image: req.user.image,
      },
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const name = asString(req.body.name);
    const email = asString(req.body.email).toLowerCase();
    const messages = [];

    if (!name) messages.push("Name must have some value.");
    if (!email) messages.push("E-mail must have some value.");

    if (messages.length > 0) {
      return validationResponse(res, messages);
    }

    const emailOwner = await User.findOne({ email });

    if (emailOwner && String(emailOwner._id) !== String(req.user._id)) {
      return validationResponse(res, ["This e-mail is already in use."]);
    }

    const user = await User.findById(req.user._id);
    const uploadedImage = req.files && req.files.image;
    let profileImage = user.image;

    if (uploadedImage) {
      const previousImage = user.image;

      profileImage = await storeAvatar(user._id, uploadedImage);
      user.image = profileImage;

      await removeAvatar(previousImage);
    }

    user.name = name;
    user.email = email;
    await user.save();

    res.status(200).json({
      data: { profileImage },
      status: "success",
    });
  } catch (error) {
    if (error.status === 422) {
      return validationResponse(res, [error.message]);
    }

    next(error);
  }
};
