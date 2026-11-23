import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images from backend/uploads
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VISTORA Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);

// Serve Frontend in Production (Single-Server Deployment)
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
