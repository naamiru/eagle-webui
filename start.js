#!/usr/bin/env node

const { spawn } = require("child_process");
const { parseArgs } = require("node:util");
const path = require("path");

function parseCliArgs() {
  const options = {
    hostname: {
      type: "string",
      short: "H",
      default: "localhost",
    },
    port: {
      type: "string",
      short: "p",
      default: "34917",
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
  --hostname HOST, -H HOST     Bind server to specific hostname or IP address (default: localhost)
  --port PORT, -p PORT         Server port number (default: 34917)
  --eagle-api-url URL          Eagle API endpoint for image management (default: http://localhost:41595)
  --help, -h                   Display this help message

Examples:
  npx eagle-webui                                             # Default settings
  npx eagle-webui --hostname 0.0.0.0                          # Allow external access
  npx eagle-webui --eagle-api-url http://192.168.1.200:41595  # Custom Eagle API endpoint
  `);
}

const args = parseCliArgs();

const startServer = () => {
  const nodeExecutable = process.execPath;
  
  // Use require.resolve to find the correct next binary across platforms
  const nextBinPath = require.resolve("next/dist/bin/next");

  const nextArgs = ["start", "--port", args.port];
  
  // Only pass --hostname if it's not 0.0.0.0 (Next.js default shows local IP when 0.0.0.0)
  if (args.hostname !== "0.0.0.0") {
    nextArgs.push("--hostname", args.hostname);
  }

  const child = spawn(nodeExecutable, [nextBinPath, ...nextArgs], {
    stdio: "inherit",
    cwd: __dirname,
    env: {
      ...process.env,
      EAGLE_API_URL: args["eagle-api-url"],
    },
  });

  child.on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
};

startServer();
