/*import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import {Server} from "socket.io";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import chatRouter from "./routes/chat.route.js";

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Track connected users
const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user registration
  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible in routes
app.set("io", io);


server.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})*/

/*import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./database/db.js";

// Load routes
//import stripeWebhookRoute from "./routes/stripeWebhook.route.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import chatRouter from "./routes/chat.route.js";



// Connect DB
connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Mount Stripe webhook route BEFORE express.json()
import stripeWebhookRoute from "./routes/stripeWebhook.route.js";
app.use("/api/v1/purchase/webhook", stripeWebhookRoute);

// ✅ Apply parsers AFTER webhook
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// ✅ Other routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute); // Excludes /webhook now
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/chat", chatRouter);

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ✅ Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});*/












import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import chatRoute from "./routes/chat.route.js";
import { stripeWebhook } from "./controllers/coursePurchase.controller.js"; 
import questionRoute from "./routes/question.route.js";
import responseRoutes from "./routes/response.route.js";
import resultRoute from './routes/result.route.js';
import examinerRoute from "./routes/examiner.route.js"
import roadmapRoute from "./routes/roadmap.route.js";
dotenv.config();

// Database connection
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Track connected users
const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user registration
  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible in routes
app.set("io", io);

app.post(
  "/api/v1/purchase/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/questions",questionRoute);
app.use("/api/v1/exam",responseRoutes);
app.use("/api/v1/result", resultRoute);
app.use("/api/v1/examiner",examinerRoute);
app.use("/api/v1/roadmap", roadmapRoute);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});