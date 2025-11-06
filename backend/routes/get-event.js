// routes/eventGet.js
import express from "express";
import { Event } from "../model/Event.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userEvents = await Event.findOne({ user: userId });
    
    res.status(200).json({
      message: "User events fetched successfully",
      events: userEvents ? userEvents.events : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
