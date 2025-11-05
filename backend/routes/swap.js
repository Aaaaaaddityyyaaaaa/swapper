import express from "express";
import { SwapRequest } from "../model/SwapRequest.js";
import { Event } from "../model/Event.js";

const router = express.Router();

router.put("/swap/:swapId", async (req, res) => {
  try {
    const { swapId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'

    // Fetch the swap request
    const swap = await SwapRequest.findById(swapId);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    if (swap.status !== "PENDING")
      return res.status(400).json({ message: "Swap already processed" });

    if (action === "REJECT") {
      swap.status = "REJECTED";
      await swap.save();
      return res.status(200).json({ message: "Swap rejected", swap });
    }

    // If accepted
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

      res.status(200).json({ message: "Swap completed successfully", swap });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
