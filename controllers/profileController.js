const { validationResult } = require("express-validator");
const User = require("../models/User");
const fs = require("fs");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    res.status(200).json({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
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

exports.updateProfile = async (req, res) => {
  try {
    // validation (begin)
    let errormessage = []
    let checkVal = true

    if (req.body.name === '') {
      errormessage.push({
        message: 'Name must have some value.'
      })
      checkVal = false
    }
    if (req.body.email === '') {
      errormessage.push({
        message: 'E-mail must have some value.'
      })
      checkVal = false
    }

    if (checkVal === false) {
      res.status(422).json({
        errorMessages: errormessage,
        status: 'validation'
      })

      return
    }
    // validation (end)

    // upload image (begin)
    const uploadDir = "public/uploads";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // get current date (begin)
    var datetime = new Date();
    var day = String(datetime.getDate());
    var month = String(datetime.getMonth());
    var year = String(datetime.getFullYear());
    var hour = String(datetime.getHours());
    var minute = String(datetime.getMinutes());
    var second = String(datetime.getSeconds());

    let fulldate = year + month + day + '-' + hour + minute + second
    // get current date (end)

    let profilePhoto = '';
    if (req.files != null) {
      let uploadedImage = req.files.image;
      uploadedImage.name = req.session.userId + '_' + fulldate + '.png'
      profilePhoto = "/../uploads/" + uploadedImage.name
      let uploadPath = __dirname + "/../public/uploads/" + uploadedImage.name;

      uploadedImage.mv(uploadPath);
    }
    // upload image (end)

    const user = await User.findById(req.session.userId)
    user.name = req.body.name
    user.email = req.body.email

    // delete image
    if (req.files != null) {
      let deleteImagePath = __dirname + "/../public" + user.image.slice(3)
      if (fs.existsSync(deleteImagePath)) {
        fs.unlinkSync(deleteImagePath);
      }
      user.image = profilePhoto
    }

    user.save()
    

    res.status(200).json({
      data: {
        profileImage: profilePhoto
      },
      status: 'success'
    })
  } catch (error) {
    res.status(400).json({
      error,
      status: 'fail'
    })
  }
}
