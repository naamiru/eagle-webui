#!/usr/bin/env node

const { spawn } = require("child_process");
const { parseArgs } = require("node:util");
const path = require("path");

function parseCliArgs() {
  const options = {
    host: {
      type: "string",
      short: "H",
      default: "localhost",
    },
    port: {
      type: "string",
      short: "p",
      default: "3000",
    },
    lang: {
      type: "string",
      short: "l",
    },
    "eagle-api-url": {
      type: "string",
      default: "http://localhost:41595",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  };

  let parsed;
  try {
    parsed = parseArgs({
      options,
      allowPositionals: false,
    });
  } catch (error) {
    console.error("❌ Invalid argument:", error.message);
    showHelp();
    process.exit(1);
  }

  // ヘルプ表示
  if (parsed.values.help) {
    showHelp();
    process.exit(0);
  }

  return parsed.values;
}

function showHelp() {
  console.log(`
Eagle WebUI Server

Usage: npx eagle-webui [options]

Options:
  --host HOST, -H HOST         Bind server to specific hostname or IP address (default: localhost)
  --port PORT, -p PORT         Server port number (default: 3000)
  --lang LANG, -l LANG         Application display language (en or ja)
  --eagle-api-url URL          Eagle API endpoint for image management (default: http://localhost:41595)
  --help, -h                   Display this help message

Examples:
  npx eagle-webui                                             # Default settings
  npx eagle-webui --host 0.0.0.0                              # Allow external access
  npx eagle-webui --eagle-api-url http://192.168.1.200:41595  # Custom Eagle API endpoint
  `);
}

const args = parseCliArgs();

const startServer = () => {
  const nodeExecutable = process.execPath;
  const serverPath = path.join(__dirname, ".next", "standalone", "server.js");

  const child = spawn(nodeExecutable, [serverPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      HOSTNAME: args.host,
      PORT: args.port,
      APP_LANG: args.lang,
      EAGLE_API_URL: args["eagle-api-url"],
    },
  });

  child.on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
};

startServer();
