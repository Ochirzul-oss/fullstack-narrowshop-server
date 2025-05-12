const { Category } = require("../models/category.js");
const { Product } = require("../models/products.js");
const { MyList } = require("../models/myList");
const { Cart } = require("../models/cart");
const { Lesson } = require("../models/lessons.js");
const { RecentlyViewd } = require("../models/recentlyViewd.js");
const { ImageUpload } = require("../models/imageUpload.js");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const { group } = require("console");

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
    for (let i = 0; i < req.files?.length; i++) {
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

router.get(`/`, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Lesson.countDocuments();
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  let lessonList = [];

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    if (req.query.location !== undefined) {
      const lessonListArr = await Lesson.find()
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

      for (let i = 0; i < lessonListArr.length; i++) {
        for (let j = 0; j < lessonListArr[i].location.length; j++) {
          if (lessonListArr[i].location[j].value === req.query.location) {
            lessonList.push(lessonListArr[i]);
          }
        }
      }
    } else {
      lessonList = await Lesson.find()
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }
  } else {
    lessonList = await Lesson.find();
  }
  return res.status(200).json({
    lessons: lessonList,
    totalPages: totalPages,
    page: page,
  });
});

router.get(`/catName`, async (req, res) => {
  let lessonList = [];

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Lesson.countDocuments();
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    const lessonListArr = await Lesson.find({ catName: req.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      lessons: lessonListArr,
      totalPages: totalPages,
      page: page,
    });
  } else {
    const lessonListArr = await Lesson.find({ catName: req.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    for (let i = 0; i < lessonListArr.length; i++) {
      for (let j = 0; j < lessonListArr[i].location.length; j++) {
        if (lessonListArr[i].location[j].value === req.query.location) {
          lessonList.push(lessonListArr[i]);
        }
      }
    }

    if (req.query.location !== "All") {
      return res.status(200).json({
        lessons: lessonList,
        totalPages: totalPages,
        page: page,
      });
    } else {
      return res.status(200).json({
        lessons: lessonListArr,
        totalPages: totalPages,
        page: page,
      });
    }
  }
});

router.get(`/catId`, async (req, res) => {
  let lessonList = [];
  let lessonListArr = [];

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Lesson.countDocuments();
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    const lessonListArr = await Lesson.find({ catId: req.query.catId })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      lessons: lessonListArr,
      totalPages: totalPages,
      page: page,
    });
  } else {
    lessonListArr = await Lesson.find({ catId: req.query.catId });

    for (let i = 0; i < lessonListArr.length; i++) {
      for (let j = 0; j < lessonListArr[i].location.length; j++) {
        if (lessonListArr[i].location[j].value === req.query.location) {
          lessonList.push(lessonListArr[i]);
        }
      }
    }

    if (req.query.location !== "All" && req.query.location!==undefined) {
      return res.status(200).json({
        lessons: lessonList,
        totalPages: totalPages,
        page: page,
      });
    } else {
      return res.status(200).json({
        lessons: lessonListArr,
        totalPages: totalPages,
        page: page,
      });
    }
  }
});

router.get(`/subCatId`, async (req, res) => {
  let lessonList = [];

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Lesson.countDocuments();
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    const lessonListArr = await Lesson.find({ subCatId: req.query.subCatId })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      lessons: lessonListArr,
      totalPages: totalPages,
      page: page,
    });
  } else {
    const lessonListArr = await Lesson.find({ subCatId: req.query.subCatId });

    for (let i = 0; i < lessonListArr.length; i++) {
      for (let j = 0; j < lessonListArr[i].location.length; j++) {
        if (lessonListArr[i].location[j].value === req.query.location) {
          lessonList.push(lessonListArr[i]);
        }
      }
    }

    if (req.query.location !== "All") {
      return res.status(200).json({
        lessons: lessonList,
        totalPages: totalPages,
        page: page,
      });
    } else {
      return res.status(200).json({
        lessons: lessonListArr,
        totalPages: totalPages,
        page: page,
      });
    }
  }
});

router.get(`/fiterByPrice`, async (req, res) => {
  let lessonList = [];

  if (req.query.catId !== "" && req.query.catId !== undefined) {
    const lessonListArr = await Lesson.find({
      catId: req.query.catId,
    }).populate("category");

    if (req.query.location !== "All") {
      for (let i = 0; i < lessonListArr.length; i++) {
        for (let j = 0; j < lessonListArr[i].location.length; j++) {
          if (lessonListArr[i].location[j].value === req.query.location) {
            lessonList.push(lessonListArr[i]);
          }
        }
      }
    } else {
      lessonList = lessonListArr;
    }
  } else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
    const lessonListArr = await Lesson.find({
      subCatId: req.query.subCatId,
    }).populate("category");

    if (req.query.location !== "All") {
      for (let i = 0; i < lessonListArr.length; i++) {
        for (let j = 0; j < lessonListArr[i].location.length; j++) {
          if (lessonListArr[i].location[j].value === req.query.location) {
            lessonList.push(lessonListArr[i]);
          }
        }
      }
    } else {
      lessonList = lessonListArr;
    }
  }

  const filteredLessons = lessonList.filter((lesson) => {
    if (req.query.minPrice && lesson.price < parseInt(+req.query.minPrice)) {
      return false;
    }
    if (req.query.maxPrice && lesson.price > parseInt(+req.query.maxPrice)) {
      return false;
    }
    return true;
  });

  return res.status(200).json({
    lessons: filteredLessons,
    totalPages: 0,
    page: 0,
  });
});

router.get(`/rating`, async (req, res) => {
  let lessonList = [];

  if (req.query.catId !== "" && req.query.catId !== undefined) {
    const lessonListArr = await Lesson.find({
      catId: req.query.catId,
      rating: req.query.rating,
    }).populate("category");

    if (req.query.location !== "All") {
      for (let i = 0; i < lessonListArr.length; i++) {
        for (let j = 0; j < lessonListArr[i].location.length; j++) {
          if (lessonListArr[i].location[j].value === req.query.location) {
            lessonList.push(lessonListArr[i]);
          }
        }
      }
    } else {
      lessonList = lessonListArr;
    }
  } else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
    const lessonListArr = await Lesson.find({
      subCatId: req.query.subCatId,
      rating: req.query.rating,
    }).populate("category");

    if (req.query.location !== "All") {
      for (let i = 0; i < lessonListArr.length; i++) {
        for (let j = 0; j < lessonListArr[i].location.length; j++) {
          if (lessonListArr[i].location[j].value === req.query.location) {
            lessonList.push(lessonListArr[i]);
          }
        }
      }
    } else {
      lessonList = lessonListArr;
    }
  }

  return res.status(200).json({
    lessons: lessonList,
    totalPages: 0,
    page: 0,
  });
});

router.get(`/get/count`, async (req, res) => {
  const lessonsCount = await Lesson.countDocuments();

  if (!lessonsCount) {
    res.status(500).json({ success: false });
  } else {
    res.send({
      lessonsCount: lessonsCount,
    });
  }
});

router.get(`/featured`, async (req, res) => {
  let lessonList = [];
  if (req.query.location !== undefined && req.query.location !== null) {
    const lessonListArr = await Lesson.find({ isFeatured: true }).populate(
      "category"
    );

    for (let i = 0; i < lessonListArr.length; i++) {
      for (let j = 0; j < lessonListArr[i].location.length; j++) {
        if (lessonListArr[i].location[j].value === req.query.location) {
          lessonList.push(lessonListArr[i]);
        }
      }
    }
  } else {
    lessonList = await Lesson.find({ isFeatured: true }).populate("category");
  }

  if (!lessonList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(lessonList);
});

router.get(`/recentlyViewd`, async (req, res) => {
  let lessonList = [];
  lessonList = await RecentlyViewd.find(req.query).populate("category");

  if (!lessonList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(lessonList);
});

router.post(`/recentlyViewd`, async (req, res) => {
  let findLesson = await RecentlyViewd.find({ prodId: req.body.id });

  var lesson;

  if (findLesson.length === 0) {
    lesson = new RecentlyViewd({
      prodId: req.body.id,
      name: req.body.name,
      description: req.body.description,
      conMinute: req.body.conMinute,
      timesOfLesson: req.body.timesOfLesson,
      lessonType: req.body.lessonType,
      groupen: req.body.groupen,
      lessonDays: req.body.lessonDays,
      maxiStudents: req.body.maxiStudents,
      images: req.body.images,
      price: req.body.price,
      subCatId: req.body.subCatId,
      catName: req.body.catName,
      subCat: req.body.subCat,
      category: req.body.category,
      category: req.body.category,
      productRam: req.body.productRam,
      size: req.body.size,
    });

    lesson = await lesson.save();

    if (!lesson) {
      res.status(500).json({
        error: err,
        success: false,
      });
    }

    res.status(201).json(lesson);
  }
});

router.post(`/create`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(404).send("invalid Category!");
  }

  const images_Array = [];
  const uploadedImages = await ImageUpload.find();

  const images_Arr = uploadedImages?.map((item) => {
    item.images?.map((image) => {
      images_Array.push(image);
      console.log(image);
    });
  });

  // Change const to let
  let lesson = new Lesson({
    name: req.body.name,
    description: req.body.description,
    conMinute: req.body.conMinute,
    timesOfLesson: req.body.timesOfLesson,
    lessonType: req.body.lessonType,
    lessonDays: req.body.lessonDays,
    maxiStudents: req.body.maxiStudents,
    groupen: req.body.groupen,
    images: images_Array,
    price: req.body.price,
    catId: req.body.catId,
    catName: req.body.catName,
    subCat: req.body.subCat,
    subCatId: req.body.subCatId,
    subCatName: req.body.subCatName,
    category: req.body.category,
    productRam: req.body.productRam,
    size: req.body.size,
    location: req.body.location !== "" ? req.body.location : "All",
    products: req.body.products
  });

  try {
    lesson = await lesson.save(); // This is now valid
    res.status(201).json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
      success: false,
    });
  }
});

router.get("/:id", async (req, res) => {
  lessonEditId = req.params.id;

  const lesson = await Lesson.findById(req.params.id).populate("category");

  if (!lesson) {
    res
      .status(500)
      .json({ message: "The lesson with the given ID was not found." });
  }
  return res.status(200).send(lesson);
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

router.delete("/:id", async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  const images = lesson.images;

  for (img of images) {
    const imgUrl = img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
      cloudinary.uploader.destroy(imageName, (error, result) => {
      });
    }

  }

  const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);

  const myListItems = await MyList.find({ lessonId: req.params.id });

  for (var i = 0; i < myListItems.length; i++) {
    await MyList.findByIdAndDelete(myListItems[i].id);
  }

  const cartItems = await Cart.find({ lessonId: req.params.id });

  for (var i = 0; i < cartItems.length; i++) {
    await Cart.findByIdAndDelete(cartItems[i].id);
  }

  if (!deletedLesson) {
    res.status(404).json({
      message: "Lesson not found!",
      success: false,
    });
  }

  res.status(200).json({
    success: true,
    message: "Lesson Deleted!",
  });
});

router.put("/:id", async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      subCat: req.body.subCat,
      description: req.body.description,
      conMinute: req.body.conMinute,
      timesOfLesson: req.body.timesOfLesson,
      lessonType: req.body.lessonType,
      lessonDays: req.body.lessonDays,
      maxiStudents: req.body.maxiStudents,
      groupen: req.body.groupen,
      images: req.body.images,
      price: req.body.price,
      catId: req.body.catId,
      subCat: req.body.subCat,
      subCatId: req.body.subCatId,
      subCatName: req.body.subCatName,
      catName: req.body.catName,
      category: req.body.category,
      numReviews: req.body.numReviews,
      productRam: req.body.productRam,
      size: req.body.size,
      location: req.body.location,
    },
    { new: true }
  );

  if (!lesson) {
    res.status(404).json({
      message: "the lesson can not be updated!",
      status: false,
    });
  }

  imagesArr = [];

  res.status(200).json({
    message: "the lesson is updated!",
    status: true,
  });

});

module.exports = router;
