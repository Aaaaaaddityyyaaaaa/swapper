import express from "express";
import { SwapRequest } from "../model/SwapRequest.js";
import { Event } from "../model/Event.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route GET /swap/sent
 * @desc Get all swap requests sent by the current user
 */
router.get("/swap/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [sent, received] = await Promise.all([
      SwapRequest.find({ requester: userId })
        .populate("receiver", "username email")
        .sort({ createdAt: -1 }),
      SwapRequest.find({ receiver: userId })
        .populate("requester", "username email")
        .sort({ createdAt: -1 })
    ]);

    res.json({ sent, received });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router