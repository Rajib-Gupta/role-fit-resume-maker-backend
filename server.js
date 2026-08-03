require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");
// const invokeGeminiAi = require("./src/services/ai.service");
const {
  invokeGeminiAi,
  generateInterviewReport,
} = require("./src/services/ai.service");
const {
  resume,
  selftDescription,
  jobDescription,
} = require("./src/services/temp");

// Connect to Db and start the server
connectToDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started at port ${process.env.PORT}`);
    });
    // generateInterviewReport({ resume, selftDescription, jobDescription })
    //   .then((report) => {
    //     console.log("Interview Report:", report);
    //   })
    //   .catch((error) => {
    //     console.error("Error generating interview report:", error);
    //   });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with an error code
  });
