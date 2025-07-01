# Socket.IO Integration Setup Guide

## Current Status

The WhatsApp API Manager Panel now includes complete Socket.IO integration with authentication fallback mechanisms. The client is configured to handle various authentication scenarios gracefully.

## Authentication Handling

The Socket.IO client now supports multiple authentication methods:

1. **Primary**: JWT token in `auth` object
2. **Fallback 1**: Bearer token in `auth.authorization`
3. **Fallback 2**: Token in query parameters
4. **Fallback 3**: Authorization header
5. **Development**: No authentication (automatic fallback)

## Backend Requirements

Your Socket.IO server should handle these events:

### Client → Server Events

- `subscribe:instance` - Subscribe to instance-specific updates
- `unsubscribe:instance` - Unsubscribe from instance updates

### Server → Client Events

- `instance:status:changed` - Instance status updates
- `instance:qr:generated` - QR code generation
- `instance:connected` - Successful WhatsApp connection
- `instance:disconnected` - WhatsApp disconnection
- `instance:error` - Error notifications

## Event Data Formats

### instance:status:changed

```javascript
{
  instanceId: "string",
  newStatus: "INIT|QR_REQUIRED|CONNECTED|DISCONNECTED|RECONNECTING|ERROR"
}
```

### instance:qr:generated

```javascript
{
  instanceId: "string",
  qrCode: "string" // Base64 or data URL
}
```

### instance:connected

```javascript
{
  instanceId: "string",
  phone: "string",
  displayName: "string"
}
```

### instance:error

```javascript
{
  instanceId: "string",
  error: "string",
  code: "string" // Optional error code
}
```

## Testing Without Backend

The client will automatically fall back to no-authentication mode if the backend doesn't support authentication yet. You'll see console warnings but the connection should still work.

## Troubleshooting

### Authentication Errors

- Check console for "Authentication failed" messages
- The client will automatically retry without authentication
- Verify backend Socket.IO server supports the expected auth format

### Connection Issues

- Ensure `NEXT_PUBLIC_API_URL` points to your Socket.IO server
- Check that the backend server is running on the correct port
- Verify CORS settings on the backend

### Event Not Received

- Check console logs for subscription confirmations
- Verify event names match exactly (case-sensitive)
- Ensure `instanceId` in events matches the current instance

## Development Mode

For development, you can run the frontend without a fully configured Socket.IO backend. The client will:

1. Attempt authentication with session token
2. Fall back to no-authentication connection
3. Log warnings but continue functioning
4. Disable real-time features gracefully

## Next Steps

1. Install dependencies: `npm install`
2. Start your Socket.IO backend server
3. Test the connection in browser console
4. Verify real-time events are working
5. Check for any authentication issues in console
