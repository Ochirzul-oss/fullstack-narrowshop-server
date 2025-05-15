const express = require("express");
const router = express.Router();
const { Calendar } = require("../models/calendar");

router.post("/create", async (req, res) => {
  const { name, description, start, end, color } = req.body;

  const newEvent = new Calendar({
    name,
    description,
    start,
    end,
    color,
  });

  try {
    const savedEvent = await newEvent.save();
    return res.status(201).json(savedEvent);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all calendar events
router.get("/", async (req, res) => {
  try {
    const events = await Calendar.find().sort({ start: 1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get one event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update an event by ID
router.put("/:id", async (req, res) => {
  const { name, description, start, end, color } = req.body;

  try {
    const updatedEvent = await Calendar.findByIdAndUpdate(
      req.params.id,
      { name, description, start, end, color },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.status(200).json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an event by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Calendar.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;