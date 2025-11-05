import express from "express";
import { Event } from "../model/Event.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/event", authMiddleware, async (req, res) => {
  try {
    const { title, startTime, endTime, isSwappable } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let userEvents = await Event.findOne({ user: userId });

    const newEvent = { title, startTime, endTime, isSwappable: isSwappable || false };

    if (!userEvents) {
      userEvents = new Event({ user: userId, events: [newEvent] });
    } else {
      userEvents.events.push(newEvent);
    }

    await userEvents.save();
    res.status(201).json({ message: "Event added successfully", data: userEvents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
