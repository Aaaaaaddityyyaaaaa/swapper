import cors from "cors"
import express from "express"
import { config } from "dotenv"
import router from "./routes/index.js"
import con from "./db/connect.js"
const app = express()

app.use(cors())
app.use(express.json())
app.use("/api",router)

const startServer = async () => {
  try {
    await con(); // connect to MongoDB
    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
  }
};

startServer();