# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eagle WebUI - A web interface for the Eagle image viewer application. This is a Next.js 15.4.6 application with TypeScript and React 19 that connects to the Eagle API running locally on port 41595.

## Development Commands

```bash
# Development (with Turbopack)
npm run dev

# Build for production  
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode enabled
- **React**: Version 19.1.0
- **Styling**: Pico CSS framework with CSS Modules
- **Gallery**: PhotoSwipe via react-photoswipe-gallery
- **Icons**: React Bootstrap Icons
- **Font**: Geist fonts (Sans and Mono variants)

## Architecture Overview

### API Integration
The app connects to Eagle's local API server at `http://localhost:41595` (defined in `/app/constants.ts`). The API provides:
- Folder structure and metadata
- Item (image/video) listings and metadata
- Direct file access through library paths

### Data Flow Architecture
1. **API Layer** (`/app/lib/api/`)
   - `folder.ts`: Fetches and transforms Eagle folder data, includes recursive child folder transformation
   - `item.ts`: Fetches items with support for folder-specific ordering and metadata
   - `library.ts`: Retrieves library configuration including file paths

2. **Image Serving** (`/app/api/items/`)
   - `/api/items/image`: Serves full resolution images directly from Eagle's library
   - `/api/items/thumbnail`: Serves thumbnails for faster gallery loading
   - Both endpoints require `id` and `libraryPath` query parameters

3. **Component Architecture**
   - Server Components fetch data (folders, items) at request time
   - Client Components (`"use client"`) handle interactive features like sorting
   - Gallery components integrate PhotoSwipe for image viewing

### Type System
Core types are defined in `/app/types/models.ts`:
- `Item`: Image/video metadata including dimensions, timestamps, ratings
- `Folder`: Hierarchical folder structure with sorting preferences
- `Library`: Library configuration and paths

## Eagle API Reference

For detailed Eagle API documentation including endpoints, sorting methods, and implementation details, see `/docs/eagle-api.md`

## Important Instructions

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving the goal
- ALWAYS prefer editing existing files to creating new ones
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested