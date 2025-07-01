# WhatsApp API Manager Panel - Architecture

## System Architecture

The WhatsApp API Manager Panel follows a **modern Next.js architecture** with clear separation of concerns and professional-grade implementation patterns.

### High-Level Architecture

```
Frontend (Next.js) ←→ External WhatsApp API Backend
       ↓
   NextAuth.js (Authentication)
       ↓
   Protected Routes & Components
       ↓
   Real-time Status Updates
```

## Source Code Structure

### Core Application Files

- **[`app/layout.jsx`](app/layout.jsx)**: Root layout with font configuration and providers
- **[`app/providers.js`](app/providers.js)**: NextAuth SessionProvider wrapper
- **[`app/page.jsx`](app/page.jsx)**: Main dashboard with instance overview and creation
- **[`middleware.js`](middleware.js)**: Route protection and authentication middleware

### Authentication System

- **[`app/api/auth/[...nextauth]/route.js`](app/api/auth/[...nextauth]/route.js)**: NextAuth configuration with credentials provider
- **[`app/login/page.jsx`](app/login/page.jsx)**: User login interface with form validation
- **[`app/register/page.jsx`](app/register/page.jsx)**: User registration interface
- **[`app/forgot-password/page.jsx`](app/forgot-password/page.jsx)**: Password recovery flow

### Instance Management

- **[`app/instance/page.jsx`](app/instance/page.jsx)**: Instance listing and management
- **[`app/instance/[id]/page.jsx`](app/instance/[id]/page.jsx)**: Individual instance detail and control
- **[`app/instance/[id]/layout.jsx`](app/instance/[id]/layout.jsx)**: Instance-specific layout wrapper
- **[`app/instance/[id]/automation/page.jsx`](app/instance/[id]/automation/page.jsx)**: Automation features (placeholder)

### UI Components

- **[`components/sidebar.jsx`](components/sidebar.jsx)**: Navigation sidebar with collapsible design
- **[`components/ui/dialog.jsx`](components/ui/dialog.jsx)**: Modal dialog component for forms and QR codes
- **[`lib/utils.js`](lib/utils.js)**: Utility functions for styling and common operations
- **[`lib/socket.js`](lib/socket.js)**: Socket.IO client configuration and connection management
- **[`hooks/useSocket.js`](hooks/useSocket.js)**: General Socket.IO connection hook
- **[`hooks/useInstanceSocket.js`](hooks/useInstanceSocket.js)**: Instance-specific real-time event handling

## Key Technical Decisions

### 1. **Next.js App Router Architecture**

- Uses modern App Router for file-based routing
- Server and client components appropriately separated
- Middleware for route protection

### 2. **Authentication Strategy**

- NextAuth.js with credentials provider
- JWT tokens for session management
- Bearer token authentication for API calls
- Custom login/register pages

### 3. **State Management Pattern**

- React hooks for local component state
- Session state managed by NextAuth
- Real-time updates via Socket.IO with custom hooks
- Form state managed locally with controlled components

### 4. **UI/UX Design System**

- Tailwind CSS for styling with custom configuration
- ShadCN UI components for accessibility (built on Radix UI)
- Framer Motion for smooth animations
- Lucide React for consistent iconography
- Professional color scheme (slate/green theme)

### 5. **API Integration Pattern**

- Environment-based API URL configuration
- Consistent error handling across API calls
- Bearer token authentication headers
- JSON-based request/response format

## Component Relationships

### Authentication Flow

```
middleware.js → NextAuth → app/login/page.jsx → app/api/auth/[...nextauth]/route.js
```

### Instance Management Flow

```
app/page.jsx (Dashboard) → app/instance/[id]/page.jsx (Details) → QR Dialog → API Calls
```

### Navigation Structure

```
components/sidebar.jsx → Route Navigation → Protected Pages → Instance Controls
```

## Critical Implementation Paths

### 1. **Instance Creation Workflow**

1. User clicks "Create New Instance" on dashboard
2. Dialog opens with form validation
3. Form submission calls API with authentication
4. Success refreshes instance list
5. New instance appears in dashboard table

### 2. **WhatsApp Connection Process**

1. User clicks "Connect Instance" on detail page
2. API call initiates connection process
3. QR dialog opens with loading state
4. QR code fetched and displayed via QRCodeCanvas
5. QR code fetched and displayed via QRCodeCanvas
6. Connection status updates in real-time

### 3. **Real-time Status Updates**

1. Instance detail page loads current status
2. Socket.IO events provide instant status updates
3. Visual indicators update based on real-time events
4. Error states displayed with timestamps
5. Connection controls enabled/disabled based on status

## Design Patterns in Use

### 1. **Compound Component Pattern**

- Dialog components with Header, Content, Description
- Sidebar with collapsible navigation items
- Form components with validation states

### 2. **Custom Hook Pattern**

- useSession for authentication state
- useRouter for navigation
- useState/useEffect for component state

### 3. **Provider Pattern**

- SessionProvider wraps entire application
- Authentication context available globally
- Consistent session management

### 4. **Conditional Rendering Pattern**

- Status-based UI updates
- Loading states and error boundaries
- Authentication-based route access

## Security Architecture

### Authentication & Authorization

- NextAuth.js handles session management
- JWT tokens for stateless authentication
- Middleware protects all routes except auth pages
- Bearer tokens for API authentication

### Data Security

- Environment variables for sensitive configuration
- No sensitive data stored in client-side code
- Secure cookie handling via NextAuth
- HTTPS enforcement in production

## Performance Considerations

### Optimization Strategies

- Next.js automatic code splitting
- Turbopack for fast development builds
- Framer Motion for smooth animations
- Efficient re-rendering with React hooks

### Real-time Updates

- Socket.IO-based real-time communication
- Event-driven updates for instant status changes
- Efficient state management to prevent unnecessary renders

## Integration Points

### External API Dependencies

- **Primary API**: `NEXT_PUBLIC_API_URL` for WhatsApp instance management
- **Authentication API**: Backend login/register endpoints
- **Instance API**: CRUD operations for WhatsApp instances
- **QR Code API**: Real-time QR code generation
- **Control API**: Connect/disconnect/restart operations

### Configuration Management

- Environment variables for API URLs
- NextAuth configuration for authentication
- Tailwind configuration for styling
- Next.js configuration for build optimization
