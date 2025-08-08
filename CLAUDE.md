# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eagle WebUI - A web interface for the Eagle image viewer application. This is a monorepo using npm workspaces with two main services.

## Architecture

### Frontend (`/front`)
- **Stack**: React 19 + TypeScript + Vite
- **Routing**: TanStack Router with file-based routing
- **State Management**: TanStack Query for server state
- **Styling**: CSS Modules + Pico CSS framework
- **Image Gallery**: react-photoswipe-gallery for image viewing
- **Key Components**:
  - `FolderList`: Displays hierarchical folder structure
  - `ItemList`: Grid view of image items
  - Routes are defined in `/src/routes/` with auto-generated route tree

### Backend Proxy (`/proxy`)
- **Stack**: Fastify + TypeScript
- **Purpose**: Proxy server that runs on the same machine as Eagle to bypass CORS and serve Eagle API requests and image files
- **Structure**: Auto-loaded plugins and routes from `/src/plugins/` and `/src/routes/`

## Development Commands

### Root level (both services)
```bash
npm install              # Install dependencies for all workspaces
npm run dev              # Start both frontend and proxy concurrently
```

### Frontend (`/front`)
```bash
npm install -w front     # Install frontend dependencies
npm run dev -w front     # Start Vite dev server with HMR (host mode)
npm run build -w front   # TypeScript check + production build
npm run lint -w front    # Run Biome linter
npm run lint:fix -w front # Auto-fix linting issues
npm run test -w front    # Run Vitest tests
npm run test:coverage -w front # Run tests with coverage report
```

### Proxy (`/proxy`)
```bash
npm install -w proxy     # Install proxy dependencies
npm run dev -w proxy     # Start with auto-reload
npm run start -w proxy   # Production mode
npm run build:ts -w proxy # Compile TypeScript
npm run test -w proxy    # Run tests
```

## Code Standards

- **Linting/Formatting**: Biome with 2-space indentation, double quotes
- **CSS Modules**: Enabled for `.module.css` files
- **TypeScript**: Strict mode with project references
- **Testing**: Vitest for frontend with browser mode support

## Data Models

- `ItemData`: Image item with id, original/thumbnail paths, dimensions
- `FolderData`: Hierarchical folder structure containing items and child folders