const { branch, Branch } = require("../models/branch");
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
      description,
      phone,
      phone1,
      email,
      images,
      teachers,
      location,
    } = req.body; // Destructure all required fields

    const branch = new Branch({
      name,
      description,
      phone,
      phone1,
      email,
      images,
      teachers,
      location,
    });

    await branch.save();
    res.status(201).json(branch);
  } catch (err) {
    console.error("Error creating branch:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get(`/`, async (req, res) => {
  const branchList = await Branch.find();

  if (!branchList) {
    res.status(500).json({ success: false });
  }
  res.send(branchList);
});

router.get("/:id", async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch  not found." });
    }
    return res.status(200).json(branch);
  } catch (error) {
    console.error("Error fetching branch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", (req, res) => {
  Branch.findByIdAndDelete(req.params.id)
    .then((branch) => {
      if (branch) {
        return res
          .status(200)
          .json({ success: true, message: "the branch is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "branch not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const branchCount = await Branch.countDocuments();

  if (!branchCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    branchCount: branchCount,
  });
});

router.put("/:id", async (req, res) => {
  const {
    name,
    description,
    phone,
    phone1,
    email,
    images,
    teachers,
    location,
  } = req.body;

  const branchExist = await Branch.findById(req.params.id);

  const branch = await Branch.findByIdAndUpdate(
    req.params.id,
    {
      name: name,
      phone: phone,
      phone1: phone1,
      email: email,
      teachers: teachers,
      location: location,
      description: description,
      images: imagesArr,
    },
    { new: true }
  );

  if (!branch) return res.status(400).send("the branch cannot be Updated!");

  res.send(branch);
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

module.exports = router;