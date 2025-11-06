import express from "express";
import { SwapRequest } from "../model/SwapRequest.js";
import { Event } from "../model/Event.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/swap/:swapId", authMiddleware, async (req, res) => {
  try {
    const { swapId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userId = req.user.id; // from authMiddleware

    // Fetch the swap request
    const swap = await SwapRequest.findById(swapId);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    // Only the receiver can accept/reject
    if (swap.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to process this swap" });
    }

    if (swap.status !== "PENDING")
      return res.status(400).json({ message: "Swap already processed" });

    // Reject the swap
    if (action === "REJECT") {
      swap.status = "REJECTED";
      await swap.save();
      return res.status(200).json({ message: "Swap rejected", swap });
    }

    // Accept the swap
    if (action === "ACCEPT") {
      // Fetch both events
      const requesterEventDoc = await Event.findOne({
        user: swap.requester,
        "events._id": swap.requesterEvent,
      });

      const receiverEventDoc = await Event.findOne({
        user: swap.receiver,
        "events._id": swap.receiverEvent,
      });

      if (!requesterEventDoc || !receiverEventDoc)
        return res.status(404).json({ message: "Events not found" });

      // Extract event subdocuments
      const requesterEvent = requesterEventDoc.events.id(swap.requesterEvent);
      const receiverEvent = receiverEventDoc.events.id(swap.receiverEvent);

      // Swap the start and end times
      const tempStart = requesterEvent.startTime;
      const tempEnd = requesterEvent.endTime;

      requesterEvent.startTime = receiverEvent.startTime;
      requesterEvent.endTime = receiverEvent.endTime;

      receiverEvent.startTime = tempStart;
      receiverEvent.endTime = tempEnd;

      // Save both
      await requesterEventDoc.save();
      await receiverEventDoc.save();

      // Mark swap as accepted
      swap.status = "ACCEPTED";
      await swap.save();

      return res.status(200).json({ message: "Swap completed successfully", swap });
    }

    // Invalid action
    return res.status(400).json({ message: "Invalid action" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
});


// DELETE /api/event/:eventId
router.delete("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const userEventDoc = await Event.findOne({ user: userId });
    if (!userEventDoc) {
      return res.status(404).json({ message: "No events found for this user." });
    }

    // Remove the specific sub-event from events[]
    const eventIndex = userEventDoc.events.findIndex(
      (e) => e._id.toString() === eventId
    );
    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found." });
    }

    userEventDoc.events.splice(eventIndex, 1);
    await userEventDoc.save();

    res.json({ message: "Event deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
