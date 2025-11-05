// models/SwapRequest.js
import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // user who initiated the swap

  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // user who owns the target slot

  requesterEvent: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  }, // the sub-event _id from requester's Event.events[]

  receiverEvent: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  }, // the sub-event _id from receiver's Event.events[]

  status: { 
    type: String, 
    enum: ["PENDING", "ACCEPTED", "REJECTED"], 
    default: "PENDING" 
  }
}, { timestamps: true });

export const SwapRequest = mongoose.model("SwapRequest", swapRequestSchema);
