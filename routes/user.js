const { User } = require("../models/user");
const { ImageUpload } = require("../models/imageUpload");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});


const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      const img = await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    let imagesUploaded = new ImageUpload({
      images: imagesArr,
    });

    imagesUploaded = await imagesUploaded.save();
    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
  }
});

router.post('/create', async (req, res) => {
  console.log('Received body:', req.body);  
  try {
    const { 
      name, 
      description,
      phone, 
      email, 
      password, 
      lastname, 
      regisnumber, 
      works, 
      country, 
      goal, 
      sex, 
      district, 
      education, 
      course, 
      street, 
      job, 
      number1, 
      images 
    } = req.body; 

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = new User({
      name,
      phone, 
      description,
      email,
      password,
      lastname,
      regisnumber,
      works,
      country,
      goal,
      sex,
      district,
      education,
      course,
      street,
      job,
      number1,
      images
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.post(`/signup`, async (req, res) => {
  const { name, phone, email, password, isAdmin } = req.body;

  try {
    const existingUser  = await User.findOne({ email: email });
    const existingUserByPh = await User.findOne({ phone: phone });

    if (existingUser ) {
      res.json({
        status: "FAILED",
        msg: "User  already exists with this email!",
      });
      return;
    }

    if (existingUserByPh) {
      res.json({
        status: "FAILED",
        msg: "User  already exists with this phone number!",
      });
      return;
    }

    const user = new User({
      name,
      email,
      phone,
      password, 
      isAdmin,
    });

    await user.save();

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      success: true,
      message: "User  registered successfully.",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.json({ status: "FAILED", msg: "Something went wrong" });
  }
});

router.post(`/signin`, async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser  = await User.findOne({ email: email });
    if (!existingUser ) {
      res.status(404).json({ error: true, msg: "User  not found!" });
      return;
    }

    const matchPassword = existingUser .password === password; 

    if (!matchPassword) {
      return res.status(400).json({ error: true, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: existingUser .email, id: existingUser ._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).send({
      user: existingUser ,
      token: token,
      msg: "User  Authenticated",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});


router.put(`/changePassword/:id`, async (req, res) => {
  const { email, newPass } = req.body;

  const existingUser  = await User.findById(req.params.id);
  if (!existingUser ) {
    return res.status(404).json({ error: true, msg: "User  not found!" });
  }

  existingUser .password = newPass; 
  await existingUser .save();

  res.send(existingUser );
});

router.get(`/`, async (req, res) => {
  const userList = await User.find();

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User  not found." });
    }
    return res.status(200).json(user); 
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

router.post(`/authWithGoogle`, async (req, res) => {
  const { name, phone, email, password, images, isAdmin } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      const result = await User.create({
        name: name,
        phone: phone,
        email: email,
        password: password,
        images: images,
        isAdmin: isAdmin,
        isVerified: true,
      });

      const token = jwt.sign(
        { email: result.email, id: result._id },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return res.status(200).send({
        user: result,
        token: token,
        msg: "User Login Successfully!",
      });
    } else {
      const existingUser = await User.findOne({ email: email });
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return res.status(200).send({
        user: existingUser,
        token: token,
        msg: "User Login Successfully!",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.put("/:id", async (req, res) => {
  const { name, phone, email, lastname, regisnumber, works, country, goal, sex, district, education, course, street, job, number1,description } = req.body;

  const userExist = await User.findById(req.params.id);

  if (req.body.password) {
    newPassword = req.body.password;
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: name,
      phone: phone,
      email: email,
      description: description,
      password: newPassword,
      images: imagesArr,
      lastname: lastname,
      regisnumber: regisnumber,
      works: works,
      country: country,
      goal: goal,
      sex: sex,
      district: district,
      education: education,
      course: course,
      street: street,
      job: job,
      number1: number1,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("the user cannot be Updated!");

  res.send(user);
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(
    imageName,
    (error, result) => {
 
    }
  );

  if (response) {
    res.status(200).send(response);
  }
});

router.post(`/forgotPassword`, async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser  = await User.findOne({ email: email });

    if (!existingUser ) {
      res.json({ status: "FAILED", msg: "User  does not exist with this email!" });
      return;
    }

    return res.status(200).json({
      success: true,
      status: "SUCCESS",
      message: "Password reset instructions sent",
    });
  } catch (error) {
    console.log(error);
    res.json({ status: "FAILED", msg: "Something went wrong" });
  }
});


router.post(`/forgotPassword/changePassword`, async (req, res) => {
    const { email, newPass } = req.body;
  
    try {
  
      const existingUser = await User.findOne({ email: email });
  
      if (existingUser) {
        const hashPassword = await bcrypt.hash(newPass, 10);
        existingUser.password = hashPassword;
        await existingUser.save();
      }
     
      return res.status(200).json({
        success: true,
        status:"SUCCESS",
        message: "Password change successfully",
      });
    } catch (error) {
      console.log(error);
      res.json({ status: "FAILED", msg: "something went wrong" });
      return;
    }
  });

module.exports = router;