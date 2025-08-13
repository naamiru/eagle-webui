# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eagle WebUI - A web interface for the Eagle image viewer application. This is a Next.js 15.4.6 application with TypeScript and React 19.

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
- **Styling**: CSS Modules
- **Font**: Geist fonts (Sans and Mono variants)

## Architecture Notes

The application uses Next.js App Router with the following structure:
- `/app` - Main application directory using App Router conventions
- Path alias `@/*` maps to root directory for cleaner imports

## Legacy Reference

The `/legacy-app/` directory contains the previous implementation built with React Router v7 and Express. This serves as reference for implementing similar functionalities in the Next.js application. Key components from legacy app include folder navigation, item lists, and image rendering capabilities.

## Important Instructions

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving the goal
- ALWAYS prefer editing existing files to creating new ones
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested