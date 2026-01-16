# 취준 매니저 (Job Prep Manager)

## Overview

A job preparation management application for Korean job seekers that provides two main features:
1. **Job Schedule Collection** - Automatically extract job posting metadata from URLs and display deadlines on a calendar
2. **Resume Experience Matching** - Match saved work experiences to resume questions and generate draft responses

The application is a proof-of-concept (PoC) demo focused on demonstrating the workflow with minimal friction (no authentication, simple UI flows).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **Data Storage**: In-memory storage (MemStorage class) - designed to be replaceable with PostgreSQL via Drizzle ORM

### Data Flow
1. Frontend makes API calls via TanStack Query
2. Express routes handle requests in `server/routes.ts`
3. Storage layer abstracts data persistence in `server/storage.ts`
4. Parser utilities in `server/parser.ts` extract job posting metadata and match experiences

### Key Design Decisions

**In-Memory Storage with Drizzle Schema**
- Current implementation uses in-memory Maps for rapid prototyping
- Schema defined with Zod in `shared/schema.ts` for type safety
- Drizzle configuration ready for PostgreSQL migration when needed
- Rationale: Fast iteration for PoC while maintaining upgrade path

**Monorepo Structure**
- `client/` - React frontend application
- `server/` - Express backend
- `shared/` - Shared types and schemas between frontend/backend
- Rationale: Single deployment unit, shared types reduce duplication

**Component Organization**
- Feature components in `client/src/components/`
- UI primitives in `client/src/components/ui/`
- Page components in `client/src/pages/`
- Rationale: Separation of reusable UI from business logic

## External Dependencies

### Database
- **Drizzle ORM** configured for PostgreSQL (`drizzle.config.ts`)
- Requires `DATABASE_URL` environment variable when using persistent storage
- Schema defined in `shared/schema.ts` and `shared/user-schema.ts`

### Third-Party Libraries
- **@tanstack/react-query**: Server state management
- **date-fns**: Date manipulation and formatting (Korean locale support)
- **zod**: Schema validation for API requests/responses
- **react-hook-form**: Form handling with validation
- **Radix UI**: Accessible UI primitives (via shadcn/ui)

### Build & Development
- **Vite**: Frontend bundler with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development banner