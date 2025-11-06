# 🌀 Swapper — Smart Task Swap & Scheduler

Swapper is a **task scheduling and swapping platform** built with the MERN stack (MongoDB, Express, React, Node.js).  
It allows users to create, manage, and swap time slots or events with others in a controlled and interactive environment.

---

## 🚀 Features

- 🔐 **User Authentication** (Signup/Login with JWT)
- 🗓️ **Event Creation & Management**
  - Add tasks/events with start and end times
  - Mark tasks as *swappable*
- 🔁 **Task Swapping**
  - View swappable tasks from other users in the **Marketplace**
  - Request to swap events
  - Accept or reject incoming swap requests
  - Automatically updates both users’ schedules upon approval
- 🛡️ **Protected Routes**
  - All core features require authentication via `authMiddleware`
- 💬 **Dynamic Dashboard**
  - View your events, sent swap requests, and received requests

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite) + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **State Handling** | React Hooks + Fetch API |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/swapper.git
cd swapper
