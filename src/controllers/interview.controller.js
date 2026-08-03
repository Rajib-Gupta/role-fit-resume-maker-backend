const pdfParse = require("pdf-parse");
const puppeteer = require("puppeteer");
const { generateInterviewReport } = require("../services/ai.service");
const InterviewReport = require("../models/interviewReport.model");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function firstNonEmptyLine(text = "") {
  return text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
}

function sanitizeResumeText(text = "") {
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith("<PARSED TEXT FOR PAGE:")) return false;
      if (/^--\s*\d+\s*of\s*\d+\s*--$/i.test(line)) return false;
      return true;
    })
    .join("\n");
}

function normalizeLines(block = "") {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractSection(text = "", heading = "", allHeadings = []) {
  if (!heading) return "";
  const lines = normalizeLines(text);
  const targetHeading = heading.toUpperCase();
  const headingSet = new Set(allHeadings.map((item) => item.toUpperCase()));

  const startIndex = lines.findIndex(
    (line) => line.toUpperCase() === targetHeading,
  );
  if (startIndex === -1) return "";

  const sectionLines = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (headingSet.has(line.toUpperCase())) break;
    sectionLines.push(line);
  }

  return sectionLines.join("\n").trim();
}

function buildBulletListHtml(lines = []) {
  const items = lines
    .map((line) => "<li>" + escapeHtml(line) + "</li>")
    .join("");
  return "<ul>" + items + "</ul>";
}

async function buildResumePdfBuffer(interviewReport) {
  const resumeText = sanitizeResumeText(interviewReport.resume || "");
  const resumeLines = normalizeLines(resumeText);
  const candidateName =
    resumeLines[0] || firstNonEmptyLine(resumeText) || "Candidate";
  const roleTitle = interviewReport.title || "Target Role";

  const HEADINGS = [
    "PROFESSIONAL SUMMARY",
    "SKILLS",
    "EXPERIENCE",
    "EDUCATION",
    "KEY PROJECTS",
    "ACHIEVEMENTS",
    "CLIENT ENGAGEMENT",
  ];

  const contactCandidates = resumeLines.slice(1, 5);
  const headingSet = new Set(HEADINGS);
  const contactLine =
    contactCandidates.find((line) => {
      if (headingSet.has(line.toUpperCase())) return false;
      return (
        line.includes("@") ||
        /\+?\d[\d\s()-]{7,}/.test(line) ||
        /linkedin|github/i.test(line)
      );
    }) || "";

  const summaryBlock =
    extractSection(resumeText, "PROFESSIONAL SUMMARY", HEADINGS) ||
    interviewReport.selfDescription ||
    "";

  const skillsBlock = extractSection(resumeText, "SKILLS", HEADINGS);
  const experienceBlock = extractSection(resumeText, "EXPERIENCE", HEADINGS);
  const educationBlock = extractSection(resumeText, "EDUCATION", HEADINGS);
  const projectsBlock = extractSection(resumeText, "KEY PROJECTS", HEADINGS);
  const achievementsBlock = extractSection(
    resumeText,
    "ACHIEVEMENTS",
    HEADINGS,
  );
  const clientBlock = extractSection(resumeText, "CLIENT ENGAGEMENT", HEADINGS);

  const roleFocusLines = (interviewReport.skillGaps || []).map(
    (gap) => `${gap.skill} (${gap.severity})`,
  );
  const prepLines = (interviewReport.preparationPlan || [])
    .flatMap((day) => day.tasks || [])
    .slice(0, 6);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(candidateName)} Resume</title>

<style>
*{
    box-sizing:border-box;
}

body{
    font-family:Arial, Helvetica, sans-serif;
    color:#000;
    background:#fff;
    margin:0;
    padding:40px;
    font-size:11pt;
    line-height:1.5;
}

header{
    text-align:center;
    margin-bottom:18px;
}

h1{
    margin:0;
    font-size:26pt;
    font-weight:700;
}

.role{
    margin-top:4px;
    font-size:13pt;
    font-weight:600;
}

.contact{
    margin-top:8px;
    font-size:10pt;
    word-break:break-word;
}

.section{
    margin-top:18px;
}

h2{
    margin:0 0 8px 0;
    font-size:12pt;
    font-weight:bold;
    text-transform:uppercase;
    border-bottom:1px solid #000;
    padding-bottom:4px;
}

p{
    margin:0;
}

ul{
    margin:6px 0 0 18px;
    padding:0;
}

li{
    margin-bottom:5px;
}

.job{
    margin-bottom:14px;
}

.job-title{
    font-weight:bold;
    font-size:11.5pt;
}

.company{
    font-weight:bold;
}

.duration{
    float:right;
    font-weight:normal;
}

.location{
    font-style:italic;
}

.clear{
    clear:both;
}

.subtle{
    color:#444;
}

.keyword{
    font-weight:bold;
}
</style>

</head>

<body>

<header>

<h1>${escapeHtml(candidateName)}</h1>

<div class="role">
${escapeHtml(roleTitle)}
</div>

${contactLine ? `<div class="contact">${escapeHtml(contactLine)}</div>` : ""}

</header>

<section class="section">

<h2>Professional Summary</h2>

<p>
${escapeHtml(summaryBlock)}
</p>

</section>

<section class="section">

<h2>Technical Skills</h2>

${
  normalizeLines(skillsBlock).length
    ? buildBulletListHtml(normalizeLines(skillsBlock))
    : buildBulletListHtml(roleFocusLines)
}

</section>

<section class="section">

<h2>Professional Experience</h2>

${
  normalizeLines(experienceBlock).length
    ? buildBulletListHtml(normalizeLines(experienceBlock))
    : "<p class='subtle'>Experience data unavailable.</p>"
}

</section>

<section class="section">

<h2>Key Projects</h2>

${
  normalizeLines(projectsBlock).length
    ? buildBulletListHtml(normalizeLines(projectsBlock))
    : buildBulletListHtml(prepLines)
}

</section>

<section class="section">

<h2>Education</h2>

${
  normalizeLines(educationBlock).length
    ? buildBulletListHtml(normalizeLines(educationBlock))
    : "<p class='subtle'>Education data unavailable.</p>"
}

</section>

<section class="section">

<h2>Achievements</h2>

${
  normalizeLines(achievementsBlock).length
    ? buildBulletListHtml(normalizeLines(achievementsBlock))
    : "<p class='subtle'>Achievements data unavailable.</p>"
}

</section>

<section class="section">

<h2>Client Engagement</h2>

${
  normalizeLines(clientBlock).length
    ? buildBulletListHtml(normalizeLines(clientBlock))
    : "<p class='subtle'>Client engagement data unavailable.</p>"
}

</section>

</body>

</html>
`;

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
  } finally {
    await browser.close();
  }
}

async function generateInterviewReportController(req, res) {
  const resumeContent = await new pdfParse.PDFParse(
    Uint8Array.from(req.file.buffer),
  ).getText();

  const { selfDescription, jobDescription } = req.body;

  const responseFromAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await InterviewReport.create({
    user: req.user.id,
    resume: resumeContent.text,
    jobDescription,
    selfDescription,
    ...responseFromAi,
  });

  res.status(201).json({
    interviewReport,
    message: "Interview report generated successfully!",
  });
}
/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function getInterviewReportByIdController(req, res) {
  const { id } = req.params;

  const interviewReport = await InterviewReport.findById(id);

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found" });
  }

  // Check if the user is authorized to access this report
  if (interviewReport.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  res.status(200).json({
    interviewReport,
    message: "Interview report fetched successfully!",
  });
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function getAllInterviewReportsController(req, res) {
  const userId = req.user.id;

  const interviewReports = await InterviewReport.find({ user: userId })
    .sort({
      createdAt: -1,
    })
    .select(
      "-skillsGaps -resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    ); // Exclude the resume, selfDescription, jobDescription, and __v fields from the response

  res.status(200).json({
    interviewReports,
    message: "All interview reports fetched successfully!",
  });
}

async function generateResumePdfByReportIdController(req, res) {
  try {
    const { id } = req.params;
    const interviewReport = await InterviewReport.findById(id);

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    if (interviewReport.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const pdfBuffer = await buildResumePdfBuffer(interviewReport);
    let safeTitle = (interviewReport.title || "resume")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();
    while (safeTitle.startsWith("-")) safeTitle = safeTitle.slice(1);
    while (safeTitle.endsWith("-")) safeTitle = safeTitle.slice(0, -1);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeTitle || "resume"}-${id}.pdf"`,
    );
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("generateResumePdfByReportIdController", error);
    return res.status(500).json({ message: "Failed to generate resume PDF" });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfByReportIdController,
};
