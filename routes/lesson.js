const { Category } = require("../models/category.js");
const { Product } = require("../models/products.js");
const { Lesson } = require("../models/lesson.js");
const { MyList } = require("../models/myList");
const { Cart } = require("../models/cart");
const { RecentlyViewd } = require("../models/recentlyViewd.js");
const { ImageUpload } = require("../models/imageUpload.js");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");

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
  const perPage = parseInt(req.query.perPage) || 10; // Default to 10 if perPage is not provided
  const totalLessons = await Lesson.countDocuments(); // Count documents in the Lesson collection
  const totalPages = Math.ceil(totalLessons / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  let lessonList = [];

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    // If you have a specific filtering logic for lessons, adjust accordingly
    lessonList = await Lesson.find()
      .populate("category") // Adjust if your Lesson model has a different reference
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
  } else {
    lessonList = await Lesson.find(); // Get all lessons if pagination is not specified
  }

  return res.status(200).json({
    lessons: lessonList, // Return lessons instead of products
    totalPages: totalPages,
    page: page,
  });
});

router.get(`/catName`, async (req, res) => {
  let lessonList = [];

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10; // Default to 10 if perPage is not provided
  const totalLessons = await Lesson.countDocuments(); // Count documents in the Lesson collection
  const totalPages = Math.ceil(totalLessons / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    const lessonListArr = await Lesson.find({ catName: req.query.catName }) // Filter by catName
      .populate("category") // Adjust if your Lesson model has a different reference
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      lessons: lessonListArr, // Return lessons instead of products
      totalPages: totalPages,
      page: page,
    });
  } else {
    const lessonListArr = await Lesson.find({ catName: req.query.catName }) // Filter by catName
      .populate("category") // Adjust if your Lesson model has a different reference
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    // If your Lesson model has a location field, adjust this logic accordingly
    for (let i = 0; i < lessonListArr.length; i++) {
      // Assuming location is an array in the Lesson model
      if (lessonListArr[i].location) {
        for (let j = 0; j < lessonListArr[i].location.length; j++) {
          if (lessonListArr[i].location[j].value === req.query.location) {
            lessonList.push(lessonListArr[i]);
          }
        }
      }
    }

    if (req.query.location !== "All") {
      return res.status(200).json({
        lessons: lessonList, // Return filtered lessons
        totalPages: totalPages,
        page: page,
      });
    } else {
      return res.status(200).json({
        lessons: lessonListArr, // Return all lessons if location is "All"
        totalPages: totalPages,
        page: page,
      });
    }
  }
});

router.get(`/catId`, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10; // Default to 10 if perPage is not provided
  const totalLessons = await Lesson.countDocuments(); // Count documents in the Lesson collection
  const totalPages = Math.ceil(totalLessons / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  // Fetch lessons based on catId
  const lessonListArr = await Lesson.find({ catId: req.query.catId }) // Filter by catId
    .populate("category") // Adjust if your Lesson model has a different reference
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();

  return res.status(200).json({
    lessons: lessonListArr, // Return lessons instead of products
    totalPages: totalPages,
    page: page,
  });
});

router.get(`/subCatId`, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10; // Default to 10 if perPage is not provided
  const totalLessons = await Lesson.countDocuments(); // Count documents in the Lesson collection
  const totalPages = Math.ceil(totalLessons / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  // Fetch lessons based on subCatId
  const lessonListArr = await Lesson.find({ subCatId: req.query.subCatId }) // Filter by subCatId
    .populate("category") // Adjust if your Lesson model has a different reference
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();

  return res.status(200).json({
    lessons: lessonListArr, // Return lessons instead of products
    totalPages: totalPages,
    page: page,
  });
});

router.get(`/filterByPrice`, async (req, res) => {
  let lessonList = [];

  // Check if catId is provided
  if (req.query.catId && req.query.catId !== "") {
    lessonList = await Lesson.find({ catId: req.query.catId }).populate("category");
  } 
  // Check if subCatId is provided
  else if (req.query.subCatId && req.query.subCatId !== "") {
    lessonList = await Lesson.find({ subCatId: req.query.subCatId }).populate("category");
  }

  // Filter lessons by price
  const filteredLessons = lessonList.filter((lesson) => {
    if (req.query.minPrice && lesson.price < parseInt(req.query.minPrice)) {
      return false;
    }
    if (req.query.maxPrice && lesson.price > parseInt(req.query.maxPrice)) {
      return false;
    }
    return true;
  });

  return res.status(200).json({
    lessons: filteredLessons, // Return lessons instead of products
    totalPages: 0, // Adjust if you implement pagination
    page: 0, // Adjust if you implement pagination
  });
});

router.get(`/rating`, async (req, res) => {
  let lessonList = [];

  if (req.query.catId && req.query.catId !== "") {
    lessonList = await Lesson.find({
      catId: req.query.catId,
      rating: req.query.rating,
    }).populate("category");
  } else if (req.query.subCatId && req.query.subCatId !== "") {
    lessonList = await Lesson.find({
      subCatId: req.query.subCatId,
      rating: req.query.rating,
    }).populate("category");
  }

  return res.status(200).json({
    lessons: lessonList, // Return lessons instead of products
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
      lessonsCount: lessonsCount, // Return lessons count
    });
  }
});

router.get(`/featured`, async (req, res) => {
  let lessonList = await Lesson.find({ isFeatured: true }).populate("category");

  if (!lessonList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(lessonList); // Return featured lessons
});

router.get(`/recentlyViewed`, async (req, res) => {
  let lessonList = await RecentlyViewed.find(req.query).populate("category"); // Adjust if you have a different model

  if (!lessonList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(lessonList); // Return recently viewed lessons
});

router.post(`/recentlyViewd`, async (req, res) => {
  let findLesson = await RecentlyViewed.find({ lessonId: req.body.id });

  var product;

  if (findLesson.length === 0) {
    const lesson = new RecentlyViewed({
      prodId: req.body.id,
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      subCatId: req.body.subCatId,
      catName: req.body.catName,
      subCat: req.body.subCat,
      category: req.body.category,
      countInStock: req.body.countInStock,
      weight: req.body.weight,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      discount: req.body.discount,
      productRam: req.body.productRam,
      size: req.body.size,
      productWeight: req.body.productWeight,
    });
    const savedLesson = await lesson.save();


    if (!savedLesson) {
      return res.status(500).json({
        success: false,
        message: "Failed to save recently viewed lesson.",
      });
    }
    return res.status(201).json(savedLesson);
  } else {
    // Optionally, you can return a message if the lesson is already in the recently viewed list
    return res.status(200).json({ message: "Lesson already viewed." });
  }
});

router.post(`/create`, async (req, res) => {
  // Check if the category exists
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(404).send("Invalid Category!");
  }

  // Assuming you have a similar image upload logic for lessons
  const images_Array = [];
  const uploadedImages = await ImageUpload.find(); // Adjust if necessary

  // Collect images from uploaded images
  uploadedImages?.forEach((item) => {
    item.images?.forEach((image) => {
      images_Array.push(image);
    });
  });

  // Create a new lesson
  const lesson = new Lesson({
    name: req.body.name,
    description: req.body.description,
    images: images_Array, // Assuming lessons have an images field
    brand: req.body.brand, // Adjust if your Lesson model does not have a brand field
    price: req.body.price, // Adjust if applicable
    oldPrice: req.body.oldPrice, // Adjust if applicable
    catId: req.body.catId, // Adjust if applicable
    catName: req.body.catName, // Adjust if applicable
    subCat: req.body.subCat, // Adjust if applicable
    subCatId: req.body.subCatId, // Adjust if applicable
    subCatName: req.body.subCatName, // Adjust if applicable
    category: req.body.category, // This should match the category field in your Lesson model
    countInStock: req.body.countInStock, // Adjust if applicable
    weight: req.body.weight, // Adjust if applicable
    rating: req.body.rating, // Adjust if applicable
    isFeatured: req.body.isFeatured, // Adjust if applicable
    discount: req.body.discount, // Adjust if applicable
    productRam: req.body.productRam, // Adjust if applicable
    size: req.body.size, // Adjust if applicable
    productWeight: req.body.productWeight, // Adjust if applicable
    // Remove location if it doesn't exist in your Lesson model
  });

  // Save the lesson
  const savedLesson = await lesson.save();

  if (!savedLesson) {
    return res.status(500).json({
      success: false,
      message: "Failed to create lesson.",
    });
  }

  return res.status(201).json(savedLesson);
});

router.get("/:id", async (req, res) => {
  const lessonId = req.params.id; // Use a more descriptive variable name

  try {
    const lesson = await Lesson.findById(lessonId).populate("category"); // Adjust if your Lesson model has a different reference

    if (!lesson) {
      return res.status(404).json({ message: "The lesson with the given ID was not found." });
    }

    return res.status(200).send(lesson);
  } catch (err) {
    return res.status(500).json({ message: "An error occurred while retrieving the lesson.", error: err });
  }
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;

  if (!imgUrl) {
    return res.status(400).json({ message: "Image URL is required." });
  }

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  try {
    const response = await cloudinary.uploader.destroy(imageName);

    if (response.result === "ok") {
      return res.status(200).json({ message: "Image deleted successfully.", response });
    } else {
      return res.status(500).json({ message: "Failed to delete image.", response });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while deleting the image.", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // Find the lesson by ID
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found!",
        success: false,
      });
    }

    // Delete associated images from Cloudinary
    const images = lesson.images;
    for (const img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    // Delete the lesson
    const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);

    // Delete associated items in MyList
    const myListItems = await MyList.find({ lessonId: req.params.id }); // Adjust if necessary
    for (const item of myListItems) {
      await MyList.findByIdAndDelete(item.id);
    }

    // Delete associated items in Cart
    const cartItems = await Cart.find({ lessonId: req.params.id }); // Adjust if necessary
    for (const item of cartItems) {
      await Cart.findByIdAndDelete(item.id);
    }

    return res.status(200).json({
      success: true,
      message: "Lesson deleted!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while deleting the lesson.",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        images: req.body.images, // Assuming lessons have an images field
        brand: req.body.brand, // Adjust if your Lesson model does not have a brand field
        price: req.body.price, // Adjust if applicable
        oldPrice: req.body.oldPrice, // Adjust if applicable
        catId: req.body.catId, // Adjust if applicable
        subCat: req.body.subCat, // Adjust if applicable
        subCatId: req.body.subCatId, // Adjust if applicable
        subCatName: req.body.subCatName, // Adjust if applicable
        catName: req.body.catName, // Adjust if applicable
        category: req.body.category, // This should match the category field in your Lesson model
        countInStock: req.body.countInStock, // Adjust if applicable
        weight: req.body.weight, // Adjust if applicable
        rating: req.body.rating, // Adjust if applicable
        numReviews: req.body.numReviews, // Adjust if applicable
        isFeatured: req.body.isFeatured, // Adjust if applicable
        productRam: req.body.productRam, // Adjust if applicable
        size: req.body.size, // Adjust if applicable
        productWeight: req.body.productWeight, // Adjust if applicable
        // Remove location if it doesn't exist in your Lesson model
      },
      { new: true } // Return the updated document
    );

    if (!lesson) {
      return res.status(404).json({
        message: "The lesson cannot be updated!",
        status: false,
      });
    }

    return res.status(200).json({
      message: "The lesson has been updated!",
      status: true,
      lesson, // Optionally return the updated lesson
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the lesson.",
      error: error.message,
    });
  }
});

module.exports = router;
