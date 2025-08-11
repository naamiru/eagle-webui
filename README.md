# Eagle WebUI

A web interface for the [Eagle](https://eagle.cool/) image viewer application.

## Requirements

- Node.js >= 22
- Eagle application running
- Currently tested on macOS only (other platforms may work but are untested)

## Installation

### 1. Run Eagle Application

First, ensure Eagle is running on your machine. The Eagle API should be accessible at `http://localhost:41595`.

### 2. Set up Proxy Server

The proxy server is required to serve local image files from your Eagle library. It must be run on the same machine as Eagle.

```bash
# Clone the repository
git clone https://github.com/naamiru/eagle-webui.git
cd eagle-webui

# Install proxy dependencies
npm install -w proxy

# Start the proxy server
npm start -w proxy
```

The proxy server will start on `http://localhost:57821`.

### 3. Access the Web Interface

1. Visit the Eagle WebUI at: https://naamiru.github.io/eagle-webui/
2. Configure the proxy server URL (typically `http://localhost:57821` or `http://[your-local-ip]:57821`)

Now you can browse your Eagle library through the web interface!

## Security Notice

⚠️ **Important**: The proxy server serves your local Eagle image files without authentication. Be careful not to expose it to public networks.

While I cannot see your data or what you do in the WebUI, if you have security concerns, please discontinue use.
