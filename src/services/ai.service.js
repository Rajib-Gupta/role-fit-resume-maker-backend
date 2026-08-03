const { GoogleGenAI } = require("@google/genai");
const z = require("zod");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function invokeGeminiAi() {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: "Hello Gemini! Explain what is Interview? ",
  });
  console.log("response", response.text);
}
const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 to 100 indicating how well the candidate matches the job description",
    ),
  technicalQuestions: z.array(
    z.object({
      question: z
        .string()
        .describe("The technical question can be asked in the interview"),
      intention: z
        .string()
        .describe("The intention behind the technical question"),
      answer: z
        .string()
        .describe(
          "How to answer the technical question, what points to cover, what approach to take, what to avoid",
        ),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z
        .string()
        .describe("The behavioral question can be asked in the interview"),
      answer: z
        .string()
        .describe(
          "How to answer the behavioral question, what points to cover, what approach to take, what to avoid",
        ),
    }),
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string().describe("The skill gap identified in the interview"),
      severity: z
        .string()
        .describe("The severity of the skill gap, can be low, medium, high"),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number().describe("The day of the preparation plan"),
      focus: z.string().describe("The focus of the preparation plan"),
      tasks: z.array(z.string()).describe("The tasks of the preparation plan"),
    }),
  ),
  title: z
    .string()
    .describe("The title of the job which the interview report is for"),
});

async function generateInterviewReport(input = {}) {
  const { resume, selfDescription, jobDescription } = input;

  if (!resume || !selfDescription || !jobDescription) {
    throw new Error(
      "generateInterviewReport requires { resume, selfDescription, jobDescription }",
    );
  }

  const prompt = `Generate an interview report for the following resume, self description and job description. Return valid JSON only. Resume: ${resume}, Self Description: ${selfDescription}, Job Description: ${jobDescription}`;

  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: prompt,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: z.toJSONSchema(interviewReportSchema),
    },
  });

  const report = interviewReportSchema.parse(
    JSON.parse(interaction.output_text),
  );

  // Normalise severity to lowercase to match the Mongoose enum
  report.skillGaps = report.skillGaps.map((g) => ({
    ...g,
    severity: g.severity.toLowerCase(),
  }));

  return report;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume PDF"),
  });
  const prompt = `Generate a resume PDF for the following resume, self description and job description. Return valid base64 encoded PDF only. Resume: ${resume}, Self Description: ${selfDescription}, Job Description: ${jobDescription}`;

  return interaction.output_text;
}

module.exports = {
  invokeGeminiAi,
  generateInterviewReport,
  generateResumePdf,
};
