# Socket.IO Troubleshooting Guide

## Overview

This guide helps troubleshoot Socket.IO connection issues in the WhatsApp API Manager Panel.

## Common Issues and Solutions

### 1. Authentication Errors

**Error Messages:**

- `Socket.IO connection error: Error: Authentication required`
- `Socket.IO connection error: Error: Authentication failed`
- `Connecting without authentication (development mode)`

**Causes:**

- Backend requires authentication but client token is invalid/missing
- NextAuth session not properly configured
- Token format mismatch between frontend and backend

**Solutions:**

1. **Check Session Status:**

   ```javascript
   // In your component
   const { data: session, status } = useSession();
   console.log("Session status:", status);
   console.log("Access token:", session?.accessToken);
   ```

2. **Verify NextAuth Configuration:**

   - Ensure `NEXTAUTH_SECRET` is set in `.env`
   - Check that login API returns proper token structure
   - Verify JWT callback properly sets `accessToken`

3. **Backend Authentication:**
   - Ensure backend Socket.IO server accepts the authentication format
   - Check if backend expects `Bearer` prefix or raw token
   - Verify backend authentication middleware

### 2. Connection Timeout

**Error Messages:**

- Connection timeout after X seconds
- Socket not connecting

**Solutions:**

1. **Check API URL:**

   ```bash
   # Verify NEXT_PUBLIC_API_URL in .env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. **Backend Server Status:**

   - Ensure backend server is running
   - Check if Socket.IO is properly configured on backend
   - Verify CORS settings allow frontend domain

3. **Network Issues:**
   - Check firewall settings
   - Verify port accessibility
   - Test with different transport methods

### 3. Development Mode Issues

**Symptoms:**

- Socket connects without authentication in development
- Real-time features work inconsistently

**Solutions:**

1. **Enable Debug Logging:**

   ```javascript
   // The system automatically enables debug logging in development
   // Check browser console for detailed logs
   ```

2. **Force Authentication:**
   ```javascript
   // In socket-config.js, temporarily disable ALLOW_NO_AUTH
   DEVELOPMENT: {
     ALLOW_NO_AUTH: false, // Force authentication even in dev
   }
   ```

### 4. Instance Subscription Issues

**Symptoms:**

- Not receiving real-time updates for specific instances
- QR codes not updating
- Status changes not reflected

**Solutions:**

1. **Check Subscription:**

   ```javascript
   // Verify instance subscription in browser console
   // Look for: "📡 Subscribing to instance: [instanceId]"
   ```

2. **Backend Event Emission:**
   - Ensure backend emits events with correct instance IDs
   - Verify event names match frontend expectations
   - Check backend logs for event emission

## Debugging Tools

### 1. Browser Console Logs

The system provides detailed logging with emojis for easy identification:

- 🔧 **Debug logs**: General debugging information
- ✅ **Success logs**: Successful operations
- ⚠️ **Warning logs**: Non-critical issues
- 🔴 **Error logs**: Critical errors
- 📡 **Socket events**: Real-time event handling

### 2. Connection Info

Use the `getConnectionInfo()` function to get detailed connection status:

```javascript
import { getConnectionInfo } from "@/lib/socket";

// In your component or browser console
console.log(getConnectionInfo());
```

### 3. Manual Retry

Use the retry function to manually attempt reconnection:

```javascript
// In your component
const { retryConnection } = useSocket();

// Call when needed
retryConnection();
```

## Configuration Options

### Development vs Production

The system automatically adjusts behavior based on `NODE_ENV`:

**Development Mode:**

- Detailed debug logging enabled
- Allows connection without authentication as fallback
- Longer timeout periods
- More retry attempts

**Production Mode:**

- Minimal logging
- Strict authentication required
- Shorter timeouts
- Fewer retry attempts

### Environment Variables

Required environment variables:

```bash
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth configuration (required for authentication)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3100
```

## Backend Requirements

For proper Socket.IO integration, the backend should:

1. **Accept Multiple Auth Methods:**

   ```javascript
   // Backend should handle these authentication formats:
   socket.handshake.auth.token;
   socket.handshake.auth.authorization;
   socket.handshake.query.token;
   socket.handshake.headers.authorization;
   ```

2. **Emit Proper Events:**

   ```javascript
   // Instance-specific events
   socket.emit("instance:status:changed", { instanceId, newStatus });
   socket.emit("instance:qr:generated", { instanceId, qrCode });
   socket.emit("instance:connected", { instanceId, phone, displayName });
   socket.emit("instance:disconnected", { instanceId });
   socket.emit("instance:error", { instanceId, error, code });
   ```

3. **Handle Subscriptions:**

   ```javascript
   // Listen for subscription requests
   socket.on("subscribe:instance", (instanceId) => {
     // Add socket to instance room
   });

   socket.on("unsubscribe:instance", (instanceId) => {
     // Remove socket from instance room
   });
   ```

## Testing Checklist

Before deploying, verify:

- [ ] Socket connects successfully with valid authentication
- [ ] Socket falls back to no-auth in development when auth fails
- [ ] Instance subscription/unsubscription works
- [ ] Real-time status updates are received
- [ ] QR code updates work properly
- [ ] Error handling displays appropriate messages
- [ ] Connection retry mechanism functions
- [ ] Cleanup happens on component unmount

## Performance Considerations

1. **Connection Pooling:**

   - Only one socket connection per session
   - Proper cleanup on component unmount
   - Subscription management per instance

2. **Event Handling:**

   - Event listeners are properly removed
   - No memory leaks from unhandled events
   - Efficient re-rendering on status changes

3. **Error Recovery:**
   - Automatic retry with exponential backoff
   - Graceful degradation when Socket.IO unavailable
   - User feedback for connection issues

## Support

If issues persist:

1. Check browser console for detailed error logs
2. Verify backend Socket.IO server configuration
3. Test with minimal authentication setup
4. Review network connectivity and CORS settings
