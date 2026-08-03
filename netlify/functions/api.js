const serverless = require("serverless-http");

const app = require("../../src/app");
const connectToDB = require("../../src/config/database");

let isConnected = false;

async function initialize() {
  if (!isConnected) {
    await connectToDB();
    isConnected = true;
    console.log("MongoDB Connected");
  }
}

const handler = serverless(app);

exports.handler = async (event, context) => {
  await initialize();
  return handler(event, context);
};