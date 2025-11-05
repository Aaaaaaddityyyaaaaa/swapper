import mongoose from "mongoose";

const singleEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isSwappable: { type: Boolean, default: false },
}, { _id: true }); // each sub-event gets its own ID

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // foreign key to User collection
  },

  events: [singleEventSchema], // array of event objects for this user

}, { timestamps: true });

export const Event = mongoose.model("Event", eventSchema);