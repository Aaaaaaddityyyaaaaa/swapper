// routes/marketplaceRoutes.js
import express from "express";
import { Event } from "../model/Event.js";
import { SwapRequest } from "../model/SwapRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/marketplace
 * Get all swappable events from other users
 */
router.get("/marketplace", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const swappable = await Event.find({ "events.isSwappable": true, user: { $ne: userId } });

    const allEvents = [];
    swappable.forEach((doc) => {
      doc.events.forEach((e) => {
        if (e.isSwappable) allEvents.push({ ...e.toObject(), user: { username: doc.user } });
      });
    });

    res.json({ events: allEvents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * POST /api/swap-request
 * Create a swap request for a swappable event
 */
router.post("/swap-request", authMiddleware, async (req, res) => {
  try {
    const { requesterEvent, receiverEvent } = req.body;
    const requester = req.user.id;

    // Check for existing pending swap request
    const existing = await SwapRequest.findOne({ requesterEvent, requester, status: "PENDING" });
    if (existing) return res.status(400).json({ message: "Swap request already pending" });

    const receiverEventDoc = await Event.findOne({ "events._id": receiverEvent });
    if (!receiverEventDoc) return res.status(404).json({ message: "Receiver event not found" });

    const swap = new SwapRequest({
      requester,
      requesterEvent,
      receiver: receiverEventDoc.user,
      receiverEvent,
      status: "PENDING",
    });

    await swap.save();
    res.status(201).json({ message: "Swap request created", swap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
