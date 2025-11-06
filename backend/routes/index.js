import express from "express";
import auth from "./auth.js";
import swap from "./swap.js";
import create from "./create.js";
import task from "./task.js";
import eventRoutes from "./get-event.js"; 
import swapRequestsRoutes from "./swap-req.js"; 
import marketplaceRoutes from "./get-marketplace.js"; // ✅ import marketplace routes

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use("/auth", auth);

// User events
router.use("/event", authMiddleware, eventRoutes);

// User creation
router.use("/create", create);

// Tasks
router.use("/event", authMiddleware, task);

// Swap actions
router.use("/swap", authMiddleware, swap);

// Swap requests
router.use("/swap-requests", authMiddleware, swapRequestsRoutes);

// ✅ Marketplace routes
router.use("/", marketplaceRoutes); // mounts /marketplace and /swap-request

export default router;
