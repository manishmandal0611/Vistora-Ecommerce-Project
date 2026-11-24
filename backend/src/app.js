import fs from "fs";
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

const normalizeOrigin = (url) =>
  typeof url === "string" ? url.trim().replace(/\/+$/, "") : "";

const allowedOrigins = [
  normalizeOrigin(process.env.CLIENT_URL),
  normalizeOrigin(process.env.RENDER_EXTERNAL_URL),
  "https://manish-vistora-shop.netlify.app",
  "https://vistora-ecommerce.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = normalizeOrigin(origin);
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
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
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

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
  const candidateDistPaths = [
    path.resolve(__dirname, "../../frontend/dist"),
    path.resolve(process.cwd(), "frontend/dist"),
    path.resolve(process.cwd(), "../frontend/dist"),
  ];

  const frontendDistPath =
    candidateDistPaths.find((distPath) => fs.existsSync(distPath)) ||
    candidateDistPaths[0];

  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }

    const indexHtmlPath = path.join(frontendDistPath, "index.html");
    if (!fs.existsSync(indexHtmlPath)) {
      return res.status(404).send("Frontend build not found");
    }

    return res.sendFile(indexHtmlPath, (err) => {
      if (err) {
        return next(err);
      }
    });
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
