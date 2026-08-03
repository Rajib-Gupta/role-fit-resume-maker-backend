const express = require("express");
const authRouter = require("./routes/auth.routes");
const { interviewRouter } = require("./routes/interview.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// use to accept body as a json
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
/* Define all Routes here*/
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;
