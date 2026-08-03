const express = require("express");
const { body } = require("express-validator");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfByReportIdController,
} = require("../controllers/interview.controller");
const upload = require("../middleware/file.middleware");
const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @desc generate new interview report on the basis of user self description, resume pdf and job description
 * @access Private
 */
interviewRouter.post(
  "/",
  authMiddleware,
  upload.single("resume"),
  generateInterviewReportController,
);

/**
 * @route GET /api/interview/:id
 * @desc get interview report by id
 * @access Private
 */
interviewRouter.get(
  "/report/:id",
  authMiddleware,
  getInterviewReportByIdController,
);

/**
 * @route GET /api/interview/reports
 * @desc get all interview reports of the logged in user
 * @access Private
 */
interviewRouter.get(
  "/reports",
  authMiddleware,
  getAllInterviewReportsController,
);

/**
 * @route GET /api/interview/report/:id/resume-pdf
 * @desc generate and download tailored resume pdf for a report
 * @access Private
 */
interviewRouter.get(
  "/report/:id/resume-pdf",
  authMiddleware,
  generateResumePdfByReportIdController,
);

module.exports = {
  interviewRouter,
};
