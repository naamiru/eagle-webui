#!/usr/bin/env node

const { parseArgs } = require("node:util");
const path = require("node:path");

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
    "eagle-library-path": {
      type: "string",
      default: "",
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

  if (parsed.values.help) {
    showHelp();
    process.exit(0);
  }

  return parsed.values;
}

function showHelp() {
  console.log(`
Eagle WebUI Server

Usage: npx @naamiru/eagle-webui [options]

Options:
  --hostname HOST, -H HOST     Bind server to specific hostname or IP address (default: localhost)
  --port PORT, -p PORT         Server port number (default: 34917)
  --eagle-library-path PATH    Path to the Eagle library folder (if omitted, detected automatically via Eagle API)
  --eagle-api-url URL          Eagle API endpoint for library detection (default: http://localhost:41595)
  --help, -h                   Display this help message

Examples:
  npx @naamiru/eagle-webui                                                 # Default settings
  npx @naamiru/eagle-webui --hostname 0.0.0.0                              # Allow external access
  npx @naamiru/eagle-webui --eagle-library-path /path/to/MyPhotos.library  # Specify library path explicitly
  `);
}

const args = parseCliArgs();

process.env.HOSTNAME = args.hostname;
process.env.PORT = args.port;
process.env.EAGLE_LIBRARY_PATH = args["eagle-library-path"];
process.env.EAGLE_API_URL = args["eagle-api-url"];

require(path.resolve(__dirname, ".next/standalone/server.js"));
