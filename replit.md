# TaskFlow - Task Management Application

## Overview

TaskFlow is a modern task management application built with a full-stack TypeScript architecture. The application features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration via Drizzle ORM. The system includes WhatsApp message integration capabilities for converting messages into tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Validation**: Zod for runtime type checking
- **API Design**: RESTful endpoints with JSON responses
- **Development**: ESBuild for production bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless driver (MIGRATED FROM IN-MEMORY)
- **ORM**: Drizzle ORM with migrations support and schema push functionality
- **Production Storage**: DatabaseStorage class with full CRUD operations via Drizzle
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **Data Migration**: Successfully migrated from MemStorage to DatabaseStorage on 2025-01-22

## Key Components

### Database Schema
- **Users Table**: User authentication and profile data
- **Tasks Table**: Core task management with status, priority, deadlines, and WhatsApp integration flags
- **WhatsApp Messages Table**: Incoming messages with conversion tracking and priority detection

### API Endpoints
- **Task Management**: CRUD operations for tasks (`/api/tasks`)
- **WhatsApp Integration**: Message retrieval and conversion endpoints (`/api/whatsapp/messages`)
- **Statistics**: Dashboard metrics endpoint (`/api/stats`)

### Frontend Components
- **Dashboard**: Main application view with statistics, task list, and quick actions
- **Task Management**: Dedicated tasks page with full CRUD operations and modal interface
- **WhatsApp Integration**: Dedicated WhatsApp page with message feed and conversion capabilities
- **Reports Page**: Statistics and metrics visualization for task performance
- **Settings Page**: Configuration panel for WhatsApp integration and notifications
- **Navigation**: Fixed sidebar navigation with active state indication and proper routing

## Data Flow

1. **Task Creation**: Users create tasks via modal forms with validation
2. **WhatsApp Integration**: Messages are imported and displayed in the feed
3. **Message Conversion**: WhatsApp messages can be converted to tasks with priority detection
4. **Real-time Updates**: TanStack Query manages cache invalidation and updates
5. **Statistics Calculation**: Server aggregates task data for dashboard metrics

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **react-hook-form**: Form management
- **zod**: Schema validation
- **tailwindcss**: CSS framework

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **ESBuild**: Backend bundling
- **TypeScript**: Type checking and compilation
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Drizzle Kit for schema pushing
- **Environment**: Replit-optimized with development banners

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database**: Migration-based schema updates
- **Serving**: Express serves both API and static files

### Configuration Management
- **Environment Variables**: `DATABASE_URL` for PostgreSQL connection
- **TypeScript**: Unified configuration for client, server, and shared code
- **Path Aliases**: Configured for clean imports across the application