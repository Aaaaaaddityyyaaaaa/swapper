// routes/marketplace.js
import express from "express";
import { Event } from "../model/Event.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/swappable-events", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ user: { $ne: req.user.id } });

    const swappable = [];
    events.forEach(doc => {
      doc.events.forEach(e => {
        if (e.isSwappable) {
          swappable.push({
            ...e.toObject(),
            user: { id: doc.user, username: doc.username || "Unknown" }
          });
        }
      });
    });

    res.json({ events: swappable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
