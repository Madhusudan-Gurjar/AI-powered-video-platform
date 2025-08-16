// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import videoRoutes from "./routes/videoRoutes.js";
// import dotenv from "dotenv";

// dotenv.config(); // Load environment variables from .env file

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log("✅ MongoDB connected");
// }).catch((err) => {
//   console.error("❌ MongoDB connection error:", err);
// });

// // Routes
// app.use("/api/videos", videoRoutes);

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });

// changes for deploy
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// ✅ CORS Middleware
// -----------------------------
const allowedOrigin = "https://ai-powered-video-platform.netlify.app";

app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Handle preflight requests explicitly
app.options("*", cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// -----------------------------
// ✅ Body parser
// -----------------------------
app.use(express.json());

// -----------------------------
// ✅ MongoDB connection
// -----------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1); // Exit if DB connection fails
});

// -----------------------------
// ✅ Routes
// -----------------------------
app.use("/api/videos", videoRoutes);

// -----------------------------
// ✅ Start server
// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

