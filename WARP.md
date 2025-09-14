# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an **Event Management System (EMS)** built with Next.js 15, TypeScript, and Supabase. The system manages events for clubs with different hosting models:

- **IIC-hosted events**: Events managed by IIC (Innovation and Incubation Center) with restricted functionality for clubs
- **Self-hosted events**: Events created and managed by clubs with full control

## Common Development Commands

### Development Server
```powershell
npm run dev
```
Starts the Next.js development server with Turbopack for faster builds. Access at http://localhost:3000

### Production Build
```powershell
npm run build
```
Creates optimized production build with Turbopack

### Production Start
```powershell
npm start
```
Starts the production server

### Package Management
```powershell
npm install
# Add new dependencies
npm install <package-name>
```

## Architecture Overview

### Core Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI Framework**: Tailwind CSS 4, Radix UI components, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with custom theming, Motion animations
- **Icons**: Lucide React, Tabler Icons

### Directory Structure
```
app/                    # Next.js app router pages
├── club/              # Club-specific routes and event management
├── admin/             # Admin dashboard for IIC management  
├── layout.tsx         # Root layout with providers
└── globals.css        # Global styles and Tailwind config

components/            # Reusable React components
├── ui/               # shadcn/ui base components
├── *-page.tsx        # Page-specific components
├── providers.tsx     # Context providers wrapper
└── theme-*.tsx       # Theme-related components

lib/                  # Utility libraries
├── supabase.ts       # Supabase client configuration
└── utils.ts          # Common utility functions

hooks/                # Custom React hooks
public/               # Static assets
```

### Key Architectural Patterns

#### Event Management Flow
1. **Event Creation**: Clubs create events through form submission with file upload (PDF blueprints)
2. **Approval Process**: Self-hosted events require approval (pending → approved/rejected)
3. **Event Types**: Free vs. paid events with different ticket management
4. **Hosting Models**: IIC-hosted (restricted access) vs. self-hosted (full control)

#### Database Schema Relationships
- `clubs` table: Club information and ownership
- `events` table: Core event data with `hosted` field ("iic" or "self")
- `event_tickets` table: Ticket types and pricing
- `event_coupons` table: Discount management  
- `after_event_reports` table: Post-event reporting

#### Authentication & Authorization
- NextAuth.js with Supabase integration
- Session-based user identification (`session?.user?.id`)
- Club ownership verification through `club_id` matching
- Role-based access (club users vs. admin users)

#### UI Architecture
- **Theme System**: Dark mode with class-based toggling (`next-themes`)
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Component Library**: shadcn/ui components with custom styling
- **Animation**: Framer Motion for sidebar and interactive elements
- **State Management**: React state with Supabase real-time subscriptions

### Database Integration
- **Supabase Client**: Configured in `lib/supabase.ts`
- **Real-time Updates**: Window focus event listeners for data refreshing
- **File Storage**: PDF blueprints stored in Supabase storage
- **Row Level Security**: Implemented for data access control

### Navigation Structure
- **Club Dashboard**: `/club` - Event management for clubs
- **Event Details**: `/club/event/[id]` - Individual event management
- **Admin Panel**: `/admin` - IIC administrative functions

### API Routes
- `/api/events/create` - Event creation with file upload handling
- Form data processing with NextAuth session validation

## Development Guidelines

### Component Organization
- Page-specific components in `/components` with descriptive names
- UI components follow shadcn/ui patterns in `/components/ui`
- Keep database queries in useEffect hooks with proper cleanup

### Database Queries
- Always filter by `club_id` when accessing club-specific data
- Use `hosted` field to distinguish between IIC and self-hosted events
- Implement proper error handling for Supabase operations

### File Upload Handling
- PDF files only, 200KB size limit for event blueprints
- Server-side processing through API routes
- Proper validation on both client and server

### Styling Conventions
- Use Tailwind classes with custom color palette (primary: #F4A4BF, secondary: #A652BC)
- Consistent dark theme with neutral-900 backgrounds
- Custom animations defined in `tailwind.config.js`

### State Management
- Local state for UI interactions
- Supabase for persistent data
- Window focus listeners for automatic data refreshing
- Session state through NextAuth

## Key Configuration Files

- `next.config.ts`: Disables ESLint and TypeScript checks for faster builds, configures image domains
- `tailwind.config.js`: Custom colors, animations, and dark mode configuration
- `components.json`: shadcn/ui configuration with New York style
- `tsconfig.json`: TypeScript configuration with path aliases (@/* for root)

## Testing Events
When testing event creation and management:
1. Ensure proper club authentication
2. Test both free and paid event types
3. Verify file upload functionality with PDF restrictions
4. Check approval workflow for self-hosted events
5. Test IIC event restrictions (limited to report submission)

## Environment Setup
- Requires Supabase project configuration
- NextAuth.js setup for authentication
- Proper environment variables for database connection
- Image domains configured for Supabase storage