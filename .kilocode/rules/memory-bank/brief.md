### Project Name

**WhatsApp API Manager Panel**

### Objective

Build a frontend dashboard for managing and monitoring one or more WhatsApp instances via an **unofficial WhatsApp API** (e.g., bayleys in backend server (.env NEXT_PUBLIC_API_URL)). The panel will provide UI access to connect, manage sessions, configure webhooks, managae and monitor instance status — **without** chat or message handling features.

---

### Target Users

- Developers, DevOps, or Admins integrating WhatsApp functionality into apps or services using an unofficial API.

---

### Features

#### 1. **Instance Connection**

- Display QR Code to authenticate WhatsApp instance
- Real-time connection status ( INIT // Initializing connection
  QR_REQUIRED // QR code must be scanned to log in
  CONNECTED // WhatsApp session is active
  DISCONNECTED // Phone disconnected, or session terminated
  RECONNECTING // Trying to re-establish session
  ERROR // Fatal error (e.g., banned, QR scan expired))
- Manual reconnect, logout, or reset options
- Show instance metadata (WhatsApp number, user agent, etc.)

#### 2. **Instance List**

- List registered instances
- Status indicator for each (Connected / Disconnected)
- Create / Remove / Restart instances

#### 3. **Webhook Configuration**

- Set/update webhook URL for incoming events
- Toggle specific webhook event types (e.g., message, status, delivery)
- Webhook test tool (optional)

#### 4. **API Info Panel**

- Display current API base URL
- Show instance tokens or credentials (securely)
- show list endpoint
- Copy-to-clipboard buttons for endpoints
- API key manager

#### 5. **Logs (Optional)**

- Display recent connection or system logs
- Filter by level (info/warn/error) or timestamp

---

### Tech Stack (Frontend)

- **Framework**: Next JS
- **UI**: Tailwind CSS and ShadCN UI
- **Real-time**: WebSocket support for live updates (socket io)
- **State Management**: Zustand if needed

---

### API Integration Notes

- Communicates with an unofficial WhatsApp API via backend services
- QR Code and status updates may come via WebSocket
- Webhook endpoints and token management require secure handling
- API base URL should be configurable (e.g., via `.env` or settings page)

---

### Deliverables

- Fully responsive admin panel
- Integrated with one or multiple WhatsApp instances
- Securely handles authentication and webhook configuration
