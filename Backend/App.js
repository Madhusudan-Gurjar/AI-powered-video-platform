// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import videoRoutes from "./routes/videoRoutes.js";
// import dotenv from "dotenv";

// dotenv.config(); // Load environment variables from .env file

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// // app.use(cors());
// // ✅ Allow only your Netlify frontend
// app.use(cors({
//   origin: "https://ai-powered-video-platform.netlify.app",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
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

// Middleware
app.use(cors({
  origin: "https://ai-powered-video-platform.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Handle preflight requests explicitly
app.options("*", cors({
  origin: "https://ai-powered-video-platform.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Extra fallback headers (in case Render ignores CORS config)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://ai-powered-video-platform.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Routes
app.use("/api/videos", videoRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
