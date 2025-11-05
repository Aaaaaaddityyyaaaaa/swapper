import express from "express"
import { User } from "../model/User.js"
import bcrypt from "bcryptjs"
const router = express.Router()
router.post("/create",async (req,res)=>
{
  try
  {
    const {username , email , password} = req.body
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    return res.status(400).json({ message: "Username or email already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res.status(201).json({ message: "User created successfully", user: newUser });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
})

export default router