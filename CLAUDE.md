# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eagle WebUI - A web interface for the Eagle image viewer application built with React Router v7 and Express.

## Commands

### Development

```bash
npm run dev              # Start development server with HMR on port 3000
npm run build           # Build for production
npm start               # Start production server
npm run typecheck       # Generate types and run TypeScript checking
npm run lint.           # Run Biome linter
npm run lint:fix        # Auto-fix linting issues
```

## Architecture

### Stack

- **Frontend**: React Router v7 with SSR enabled
- **Backend**: Express server with compression and logging
- **Build**: Vite with React Router plugin
- **Styling**: Pico CSS framework (app/styles/pico.css)
- **Code Quality**: Biome for linting/formatting (2-space indentation, double quotes)

### Key Files

- `server.js`: Main Express server, handles both development (with Vite HMR) and production modes
- `server/app.ts`: React Router request handler with Express integration and load context
- `react-router.config.ts`: React Router configuration (SSR enabled)
- `vite.config.ts`: Vite configuration with React Router plugin
- `app/routes.ts`: Route definitions using React Router's file-based routing
- `app/root.tsx`: Root application component

### Development vs Production

- **Development**: Uses Vite dev server middleware for HMR, loads `server/app.ts` directly
- **Production**: Serves static assets from `build/client`, uses compiled server bundle from `build/server`

### Server Configuration

- Port: 3000 (configurable via PORT env variable)
- Compression enabled
- Morgan logging in production
- Static asset caching: 1 year for versioned assets, 1 hour for client files
