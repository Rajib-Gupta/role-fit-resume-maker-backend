const express = require("express");
const authRouter = require("./routes/auth.routes");
const { interviewRouter } = require("./routes/interview.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.disable("x-powered-by");

const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = new Set(
  (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : defaultOrigins)
    .map((origin) => origin.trim())
    .filter(Boolean),
);

// use to accept body as a json
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use((req, res, next) => {
  console.log("Original URL:", req.originalUrl);
  console.log("Path:", req.path);
  next();
});
/* Define all Routes here*/
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;
