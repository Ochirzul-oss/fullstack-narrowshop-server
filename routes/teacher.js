const {Teacher} = require("../models/teacher")
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

router.post("/create", async (req, res) => {
  console.log("Received body:", req.body);
  try {
    const {
      name,
      phone,
      description,
      phone1,
      email,
      password,
      lastname,
      regisnumber,
      branch,
      sex,
      education,
      job,
      images,
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const teacher = new Teacher({
      lastname,
      name,
      phone,
      description,
      phone1,
      email,
      password,
      regisnumber,
      sex,
      branch,
      job,
      education,
      images,
    });

    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    console.error("Error creating teacher:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(`/signup`, async (req, res) => {
    const { name, phone, email, password } = req.body;
  
    try {
      const existingTeacher = await Teacher.findOne({ email: email });
      const existingTeacherByPh = await Teacher.findOne({ phone: phone });
  
      if (existingTeacher) {
        res.json({
          status: "FAILED",
          msg: "Teacher already exists with this email!",
        });
        return;
      }
  
      if (existingTeacherByPh) {
        res.json({
          status: "FAILED",
          msg: "Teacher already exists with this phone number!",
        });
        return;
      }
  
      const newTeacher = new Teacher({ // Changed variable name to newTeacher
        name,
        email,
        phone,
        password,
      });
  
      await newTeacher.save(); // Use newTeacher instead of Teacher
  
      const token = jwt.sign(
        { email: newTeacher.email, id: newTeacher._id },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );
  
      return res.status(200).json({
        success: true,
        message: "Teacher registered successfully.",
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
    const existingTeacher = await Teacher.findOne({ email: email });
    if (!existingTeacher) {
      res.status(404).json({ error: true, msg: "Teacher  not found!" });
      return;
    }

    const matchPassword = existingTeacher.password === password;

    if (!matchPassword) {
      return res.status(400).json({ error: true, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: existingTeacher.email, id: existingTeacher._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).send({
      teacher: existingTeacher,
      token: token,
      msg: "Teacher Authenticated",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

router.put(`/changePassword/:id`, async (req, res) => {
  const { email, newPass } = req.body;

  const existingTeacher = await Teacher.findById(req.params.id);
  if (!existingTeacher) {
    return res.status(404).json({ error: true, msg: "Teacher not found!" });
  }

  existingTeacher.password = newPass;
  await existingTeacher.save();

  res.send(existingTeacher);
});

router.get(`/`, async (req, res) => {
  const teacherList = await Teacher.find();

  if (!teacherList) {
    res.status(500).json({ success: false });
  }
  res.send(teacherList);
});

router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher  not found." });
    }
    return res.status(200).json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", (req, res) => {
  Teacher.findByIdAndDelete(req.params.id)
    .then((teacher) => {
      if (teacher) {
        return res
          .status(200)
          .json({ success: true, message: "the teacher is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "teacher not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const teacherCount = await Teacher.countDocuments();

  if (!teacherCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    teacherCount: teacherCount,
  });
});

router.put("/:id", async (req, res) => {
  const {
    lastname,
    name,
    phone,
    phone1,
    description,
    email,
    regisnumber,
    job,
    branch,
    sex,
    education,
  } = req.body;

  const teacherExist = await Teacher.findById(req.params.id);

  if (req.body.password) {
    newPassword = req.body.password;
  } else {
    newPassword = teacherExist.passwordHash;
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    {
      name: name,
      phone: phone,
      phone1: phone1,
      email: email,
      description: description,
      password: newPassword,
      images: imagesArr,
      lastname: lastname,
      regisnumber: regisnumber,
      sex: sex,
      education: education,
      job: job,
      branch: branch,
    },
    { new: true }
  );

  if (!teacher) return res.status(400).send("the teacher cannot be Updated!");

  res.send(teacher);
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(
    imageName,
    (error, result) => {}
  );

  if (response) {
    res.status(200).send(response);
  }
});

router.post(`/forgotPassword`, async (req, res) => {
  const { email } = req.body;

  try {
    const existingTeacher = await Teacher.findOne({ email: email });

    if (!existingTeacher) {
      res.json({
        status: "FAILED",
        msg: "Teacher does not exist with this email!",
      });
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
    const existingTeacher = await Teacher.findOne({ email: email });

    if (existingTeacher) {
      const hashPassword = await bcrypt.hash(newPass, 10);
      existingTeacher.password = hashPassword;
      await existingTeacher.save();
    }

    return res.status(200).json({
      success: true,
      status: "SUCCESS",
      message: "Password change successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ status: "FAILED", msg: "something went wrong" });
    return;
  }
});

module.exports = router;