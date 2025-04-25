const express = require("express");
const router = express.Router();
const { BachelorPrice } = require("../models/bachelorprice"); 

// Create a new BachelorPrice
router.post("/create", async (req, res) => {
    const { year,description, price } = req.body;

    const newBachelorPrice = new BachelorPrice({
        year,
        description,
        price,
    });

    try {
        const savedBachelorPrice = await newBachelorPrice.save();
        return res.status(201).json(savedBachelorPrice);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get all BachelorPrices
router.get("/", async (req, res) => {
    try {
        const bachelorPrices = await BachelorPrice.find();
        return res.status(200).json(bachelorPrices);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get a BachelorPrice by ID
router.get("/:id", async (req, res) => {
    try {
        const bachelorPrice = await BachelorPrice.findById(req.params.id);
        if (!bachelorPrice) {
            return res.status(404).json({ message: "BachelorPrice not found." });
        }
        return res.status(200).json(bachelorPrice);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Update a BachelorPrice by ID
router.put("/:id", async (req, res) => {
    const { year, description, price } = req.body;

    try {
        const updatedBachelorPrice = await BachelorPrice.findByIdAndUpdate(
            req.params.id,
            { year, description, price },
            { new: true }
        );

        if (!updatedBachelorPrice) {
            return res.status(404).json({ message: "BachelorPrice not found." });
        }

        return res.status(200).json(updatedBachelorPrice);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a BachelorPrice by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedBachelorPrice = await BachelorPrice.findByIdAndDelete(req.params.id);
        if (!deletedBachelorPrice) {
            return res.status(404).json({ message: "BachelorPrice not found." });
        }
        return res.status(200).json({ message: "BachelorPrice deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
