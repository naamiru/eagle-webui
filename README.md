# Eagle WebUI

A web interface for the [Eagle](https://eagle.cool/) image viewer application.

> [!NOTE]
> Looking for an iOS app? Check out [Eagle Viewer for iOS](https://github.com/naamiru/eagle-viewer-ios) - a native iPhone app for viewing your Eagle library.

## Screenshots

<table>
<tr>
<td width="70%">

![PC](docs/screenshots/pc.png)

</td>
<td width="30%">

![Mobile](docs/screenshots/mobile.png)

</td>
</tr>
</table>

## Features

- Read-only viewer that won't modify your library, or consume extra storage
- Responsive UI for desktop and mobile
- Multi-language support in English, Japanese, Korean, and Chinese (Simplified/Traditional)
- Simple one-command setup

## Requirements

- Node.js >= 18.18.0
- Eagle app 4.x

## Installation and Usage

Make sure the Eagle app is running on the same machine, then run:

```bash
npx @naamiru/eagle-webui
```

Then open http://localhost:34917/ in your browser.

### Accessing from Other Devices

Make the interface reachable from other devices on your network:

```bash
npx @naamiru/eagle-webui --hostname 0.0.0.0
```

After running this command, open `http://<your-computer's-LAN-IP>:34917/` from each device.

**⚠️ Security Warning:** This application serves images without authentication. Do not expose it to public networks. If you need remote access, I recommend using a VPN—services like [Tailscale](https://tailscale.com) could help.

### Command-line Options

| Option                 | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `--hostname`           | Bind server to a specific hostname or IP address (default: localhost)               |
| `--port`               | Server port number (default: 34917)                                                 |
| `--eagle-library-path` | Path to the Eagle library folder (if omitted, detected automatically via Eagle API) |
| `--eagle-api-url`      | Eagle API endpoint for library detection (default: http://localhost:41595)          |
