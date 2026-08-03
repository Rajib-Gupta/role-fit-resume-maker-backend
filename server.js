require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

// Connect to Db and start the server
connectToDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with an error code
  });

