# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Graph-based note-taking app with Electron frontend and Redis backend. Notes contain HTML (Lexical),
GeoJSON (Leaflet), and drawings (Excalidraw).

## Version Control

When you're done making a bunch of changes, run git add and git commit to preserve them.

## Development Phases

1. Redis graph database + CRUD library
2. Basic electron frontend (viewing, linking, searching)
3. Adding in more complex components (Leaflet, Lexical, Excalidraw)

## Build/Test Commands

- Run database tests: `npm test -- --scope=database`
- Run frontend tests: `npm test -- --scope=frontend`
- Run component tests: `npm test -- --scope=components`
- Run single test: `npm test -- -t "test name"`
- Run linting: `npm run lint`
- Start Electron app: `npm run start`
- Dev mode: `npm run dev`

## Code Style Guidelines

- **Structure**: Monorepo with packages for database, frontend, components
- **Language**: TypeScript throughout with strict typing
- **Database**: Redis queries in dedicated service modules
- **Components**: Pure components with props-based configuration
- **Formatting**: Prettier with 2-space indentation
- **State Management**: Redux for global state, React hooks for local state
- **Error Handling**: Custom error types, consistent logging
- **API Pattern**: Async/await with proper error handling
- **Data Models**: Interfaces for all data structures (Notes, Tags, Components)
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Libraries** Use well-tested libraries rather than building from scratch, where possible.
