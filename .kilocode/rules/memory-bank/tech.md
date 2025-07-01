# WhatsApp API Manager Panel - Technology Stack

## Core Technologies

### Frontend Framework

- **Next.js 15.3.4**: Modern React framework with App Router
- **React 18.3.1**: Component-based UI library
- **TypeScript**: Not currently used (JavaScript project)

### Authentication & Security

- **NextAuth.js 4.24.11**: Authentication library for Next.js
- **JWT Tokens**: Session management and API authentication
- **Middleware**: Route protection and authentication checks

### Styling & UI

- **Tailwind CSS 4**: Utility-first CSS framework
- **ShadCN UI**: Component library built on Radix UI primitives
  - `@radix-ui/react-dialog 1.1.14`: Modal dialogs (underlying primitive)
- **Framer Motion 12.19.1**: Animation library
- **Lucide React 0.523.0**: Icon library
- **Class Variance Authority 0.7.1**: Component variant management
- **Tailwind Merge 3.3.1**: Utility class merging
- **CLSX 2.1.1**: Conditional class names

### Specialized Libraries

- **QRCode.react 4.2.0**: QR code generation and display
- **Socket.IO Client 4.8.1**: Real-time communication with backend
- **@xyflow/react 12.7.1**: Flow diagram components (potentially unused, needs verification)

### Development Tools

- **Turbopack**: Fast bundler for development
- **PostCSS**: CSS processing
- **tw-animate-css 1.3.4**: Animation utilities

## Development Setup

### Environment Configuration

```bash
# Development server
npm run dev  # Runs on port 3100 with Turbopack

# Production build
npm run build
npm run start

# Linting
npm run lint
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000    # Backend API URL
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET_HERE      # NextAuth secret
NEXTAUTH_URL=http://localhost:3000           # NextAuth callback URL
```

### Port Configuration

- **Development**: Port 3100 (configured in package.json)
- **Backend API**: Port 3000 (NEXT_PUBLIC_API_URL)

## Technical Constraints

### Browser Compatibility

- Modern browsers supporting ES6+
- React 18 requirements
- CSS Grid and Flexbox support

### Performance Requirements

- Client-side rendering for dynamic content
- Server-side rendering for static pages
- Optimized bundle splitting via Next.js

### Security Constraints

- HTTPS required in production
- Secure cookie handling
- CORS configuration for API calls
- Environment variable protection

## Dependencies Analysis

### Production Dependencies

```json
{
  "@radix-ui/react-dialog": "^1.1.14", // Modal components
  "@xyflow/react": "^12.7.1", // Flow diagrams (check usage)
  "class-variance-authority": "^0.7.1", // Component variants
  "clsx": "^2.1.1", // Conditional classes
  "framer-motion": "^12.19.1", // Animations
  "lucide-react": "^0.523.0", // Icons
  "next": "15.3.4", // Framework
  "next-auth": "^4.24.11", // Authentication
  "qrcode.react": "^4.2.0", // QR codes
  "react": "^18.3.1", // UI library
  "react-dom": "^18.3.1", // DOM rendering
  "tailwind-merge": "^3.3.1" // Utility merging
}
```

### Development Dependencies

```json
{
  "@tailwindcss/postcss": "^4", // PostCSS integration
  "tailwindcss": "^4", // CSS framework
  "tw-animate-css": "^1.3.4" // Animation utilities
}
```

## Tool Usage Patterns

### State Management

- **Local State**: React useState/useReducer
- **Session State**: NextAuth useSession
- **Form State**: Controlled components
- **No Global State**: No Redux/Zustand currently

### API Communication

- **Fetch API**: Native browser fetch
- **Authentication**: Bearer token headers
- **Error Handling**: Try-catch with user feedback
- **Real-time**: Socket.IO for real-time updates with improved configuration

### Styling Approach

- **Utility-First**: Tailwind CSS classes
- **Component Variants**: CVA for consistent styling
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: Slate/Green professional theme

### Animation Strategy

- **Framer Motion**: Page transitions and micro-interactions
- **CSS Animations**: Tailwind animation utilities
- **Performance**: Hardware-accelerated transforms

## Configuration Files

Includes `socket-config.js` for Socket.IO configuration.

### `socket-config.js`

Contains configuration settings for Socket.IO, including:

- Development vs. Production settings
- Debug logging options
- Connection timeouts and retry attempts
- Socket.IO event names

### Next.js Configuration

```javascript
// next.config.mjs
export default {
  // Standard Next.js configuration
  // Turbopack enabled for development
};
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  // Custom color scheme
  // Component-specific utilities
  // Animation extensions
};
```

### PostCSS Configuration

```javascript
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

## Integration Patterns

### API Integration

- **Base URL**: Environment-configured
- **Authentication**: Automatic token injection
- **Error Handling**: Consistent error responses
- **Request Format**: JSON payloads

### Component Architecture

- **Composition**: Compound components
- **Props Interface**: TypeScript-style prop validation
- **Event Handling**: Callback patterns
- **State Lifting**: Parent-child communication

### File Organization

```
app/                    # Next.js App Router
├── api/               # API routes
├── (auth)/            # Authentication pages
├── instance/          # Instance management
└── globals.css        # Global styles

components/            # Reusable components
├── ui/               # Base UI components
└── sidebar.jsx       # Navigation

lib/                  # Utilities
└── utils.js          # Helper functions
```

## Performance Optimizations

### Bundle Optimization

- **Code Splitting**: Automatic via Next.js
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Google Fonts integration

### Runtime Performance

- **React Optimization**: Proper key props and memo usage
- **API Efficiency**: Conditional requests
- **State Updates**: Batched updates
- **Memory Management**: Cleanup in useEffect

## Future Technical Considerations

### Potential Upgrades

1. **TypeScript Migration**: Type safety and better DX
2. **State Management**: Zustand for complex state
3. **Testing Framework**: Jest + React Testing Library
4. **Monitoring**: Error tracking and analytics
5. **PWA Features**: Offline capability and push notifications

The Socket.IO implementation has been improved with better configuration and error handling.
