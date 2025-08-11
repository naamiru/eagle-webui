# Eagle WebUI

A web interface for the [Eagle](https://eagle.cool/) image viewer application.

## Requirements

- Node.js >= 22
- Eagle application (version 4.0.0 or higher) running
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

Copy the setup URL from the console output. It will look like:

```
Eagle WebUI Ready! Visit this URL to start using the web interface:
http://192.168.1.100:5173/settings?url=http://192.168.1.100:57821&token=...
```

### 3. Access the Web Interface

For first-time setup:

1. Open the setup URL from step 2 in your browser (or visit https://naamiru.github.io/eagle-webui/)
2. The proxy URL and authentication token will be configured automatically
3. You'll be redirected to the main interface once connected

Now you can browse your Eagle library through the web interface!

## Security Notice

⚠️ **Important**: The proxy server serves your local Eagle image files with simple token authentication. Be careful not to expose it to public networks.

While I cannot see your data or what you do in the WebUI, if you have security concerns, please discontinue use.
