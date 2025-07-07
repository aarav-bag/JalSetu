# JalSetu - Smart Water Management System

## Overview

JalSetu is a smart water management application for farmers that provides real-time monitoring of water quality, soil moisture, weather predictions, and AI-powered irrigation recommendations. The system combines IoT data collection with AI-driven insights to optimize water usage and improve crop yields.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, styled using Tailwind CSS and shadcn/ui components
- **Backend**: Node.js/Express server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite for frontend bundling and development
- **Authentication**: Passport.js with local strategy and session-based auth

### Monorepo Structure
The application follows a monorepo structure with three main directories:
- `client/` - React frontend application
- `server/` - Express backend server
- `shared/` - Shared TypeScript schemas and types

## Key Components

### Frontend Architecture
- **React Router**: Uses wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Custom component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme system
- **Theming**: Dynamic theme switching with dark/light mode support
- **Internationalization**: Multi-language support (English, Hindi, Spanish, French, German, Portuguese)

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging, authentication, and error handling
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with bcrypt password hashing
- **AI Integration**: Multiple AI providers (Google Gemini, Perplexity, Eden AI) with fallback to local knowledge base

### Data Models
- **Users**: User accounts with authentication credentials
- **Farms**: Farm entities linked to users
- **Fields**: Subdivisions of farms for granular monitoring
- **Water Quality**: pH, TDS, and temperature measurements
- **Soil Moisture**: Field-specific moisture level readings
- **Weather Predictions**: Forecast data for irrigation planning
- **Irrigation Tips**: AI-generated recommendations

## Data Flow

1. **User Authentication**: Users register/login through the frontend, which communicates with the backend authentication endpoints
2. **Farm Management**: Users can view and manage their farms, fields, and associated data
3. **Real-time Monitoring**: The system displays current water quality, soil moisture, and weather data
4. **AI Recommendations**: The chatbot system processes user queries through multiple AI providers
5. **Data Persistence**: All user data and measurements are stored in PostgreSQL database

## External Dependencies

### AI Services
- **Google Gemini**: Primary AI provider for chatbot responses
- **Perplexity API**: Alternative AI provider for agricultural queries
- **Eden AI**: Third AI provider option
- **Local Knowledge Base**: Fallback system with pre-programmed agricultural knowledge

### Database
- **Neon Database**: Cloud PostgreSQL database with WebSocket support
- **Drizzle ORM**: Type-safe database operations and migrations

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **TanStack Query**: Server state management
- **Recharts**: Data visualization for reports

## Deployment Strategy

### Frontend Deployment
- **Build Command**: `vite build`
- **Output Directory**: `dist/public`
- **Framework**: Vite-based static site generation
- **API Routing**: Configured to proxy API calls to backend

### Backend Deployment
- **Build Process**: TypeScript compilation with esbuild bundling
- **Production Command**: `node dist/index.js`
- **Environment**: Node.js production environment
- **Database**: PostgreSQL connection via environment variables

### Development Workflow
- **Development Server**: Hot-reload enabled Vite dev server
- **API Development**: Express server with TypeScript compilation
- **Database Migrations**: Drizzle Kit for schema management

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```