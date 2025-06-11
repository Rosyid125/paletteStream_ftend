# WebSocket Notification System - Improved Implementation

## Overview

Mengatasi masalah koneksi WebSocket yang sering terputus dengan implementasi yang lebih robust dan reliable berdasarkan dokumentasi backend yang terbaru.

## Fitur Utama

### 1. **Improved WebSocket Service** (`src/services/notificationSocket.js`)

- **Auto-reconnection**: Otomatis mencoba reconnect dengan exponential backoff
- **Connection monitoring**: Real-time monitoring status koneksi
- **Error handling**: Comprehensive error handling dengan fallback
- **Toast notifications**: Integrated dengan sistem notifikasi toast
- **Sound support**: Optional notification sound
- **Callback system**: Event-driven architecture untuk UI updates

### 2. **Enhanced NotificationContext** (`src/contexts/NotificationContext.jsx`)

- **Separation of concerns**: WebSocket logic dipisah dari context
- **Connection state**: Tracking status koneksi real-time
- **Improved error handling**: Better error recovery
- **Memory optimization**: Proper cleanup dan unsubscribe

### 3. **Updated UI Components**

- **Connection indicator**: Visual feedback status koneksi
- **Reconnect button**: Manual reconnect capability
- **Status badges**: Real-time connection status di dropdown
- **Error messaging**: User-friendly error messages

## Technical Implementation

### WebSocket Configuration

```javascript
this.socket = io(socketUrl, {
  withCredentials: true, // Untuk HttpOnly cookies
  transports: ["websocket", "polling"], // Fallback transport
  autoConnect: true, // Auto connect
  reconnection: true, // Auto reconnection
  reconnectionAttempts: 5, // Max attempts
  reconnectionDelay: 1000, // Initial delay
  reconnectionDelayMax: 30000, // Max delay
  timeout: 20000, // Connection timeout
  forceNew: false, // Reuse connection
});
```

### Event Handling

```javascript
// Core events
socket.on("connect", () => {
  /* handle connect */
});
socket.on("disconnect", (reason) => {
  /* handle disconnect */
});
socket.on("connect_error", (error) => {
  /* handle errors */
});
socket.on("reconnect", (attemptNumber) => {
  /* handle reconnect */
});

// Notification events
socket.on("receive_notification", (notification) => {
  /* real-time notification */
});
socket.on("test_notification", (notification) => {
  /* development testing */
});
socket.on("refresh_tokens", (tokens) => {
  /* token refresh */
});
```

### Exponential Backoff Strategy

```javascript
// Progressive delay untuk reconnection
reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);

// Reset delay setelah successful connection
if (connected) {
  reconnectDelay = 1000; // Reset to 1 second
}
```

## UI/UX Improvements

### 1. **Connection Status Indicator**

```jsx
// Visual indicator di notification dropdown
<Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? <Wifi /> : <WifiOff />}</Badge>
```

### 2. **Reconnect Functionality**

```jsx
// Manual reconnect button
{
  !isConnected && (
    <Button onClick={handleReconnect}>
      <Wifi className="h-3 w-3 mr-1" />
      Reconnect
    </Button>
  );
}
```

### 3. **Toast Notifications**

```javascript
// Enhanced toast with navigation
toast.custom((t) => (
  <div onClick={() => navigate(path)}>
    <h4>{title}</h4>
    <p>{message}</p>
  </div>
));
```

## Files Modified/Created

### New Files

- `src/services/notificationSocket.js` - Main WebSocket service
- `src/components/WebSocketStatus.jsx` - Status indicator component

### Modified Files

- `src/contexts/NotificationContext.jsx` - Updated to use new service
- `src/components/NotificationDropdown.jsx` - Added connection status
- `src/components/ShadcnSidebar.jsx` - Added Bell icon import

## Configuration

### Environment Variables

```env
VITE_SOCKET_URL=wss://yourdomain.com
# or
VITE_SOCKET_URL=http://localhost:8000
```

### Backend Compatibility

Compatible dengan dokumentasi backend:

- `receive_notification` event
- `test_notification` event
- `refresh_tokens` event
- `withCredentials: true` untuk HttpOnly cookies

## Benefits

### 1. **Reliability**

- ✅ Auto-reconnection dengan smart retry logic
- ✅ Graceful handling of network issues
- ✅ Proper cleanup dan memory management
- ✅ Fallback ke polling jika WebSocket gagal

### 2. **User Experience**

- ✅ Real-time connection status
- ✅ Manual reconnect option
- ✅ Smooth toast notifications
- ✅ No data loss selama disconnect

### 3. **Developer Experience**

- ✅ Better debugging dengan comprehensive logging
- ✅ Event-driven architecture
- ✅ Easy to extend dan customize
- ✅ TypeScript-ready structure

### 4. **Performance**

- ✅ Efficient event handling
- ✅ Memory leak prevention
- ✅ Optimized reconnection strategy
- ✅ Reduced server load

## Usage Examples

### Basic Usage

```javascript
// Service sudah ter-setup secara otomatis
// NotificationContext akan handle semua WebSocket logic

// Manual control jika diperlukan
import notificationSocket from "@/services/notificationSocket";

// Check connection status
const status = notificationSocket.getConnectionStatus();
console.log("Connected:", status.isConnected);

// Force reconnect
notificationSocket.forceReconnect();

// Listen for connection changes
const unsubscribe = notificationSocket.onConnectionChange((connected) => {
  console.log("Connection changed:", connected);
});
```

### Custom Notification Handling

```javascript
// Register custom notification handler
const unsubscribe = notificationSocket.onNewNotification((notification) => {
  // Custom logic untuk handle notification
  console.log("Custom handler:", notification);
});

// Cleanup
unsubscribe();
```

## Testing

### Development Testing

```javascript
// Test notification via NotificationTester component
// Tersedia di /notification-test route

// Manual test via browser console
notificationSocket.emit("test_notification", {
  type: "like",
  data: { sender_username: "testuser" },
});
```

### Connection Testing

```javascript
// Test disconnect/reconnect
notificationSocket.disconnect();
setTimeout(() => notificationSocket.connect(), 2000);

// Test network failure simulation
// Matikan internet untuk test auto-reconnect
```

## Troubleshooting

### Common Issues

1. **Connection fails initially**

   - Check VITE_SOCKET_URL environment variable
   - Verify backend WebSocket server is running
   - Check browser console for CORS errors

2. **Frequent disconnections**

   - Check network stability
   - Verify server keeps connection alive
   - Review server logs for connection drops

3. **Notifications not arriving**
   - Check if user is properly authenticated
   - Verify WebSocket connection status
   - Test with NotificationTester component

### Debug Mode

```javascript
// Enable detailed logging
localStorage.setItem("debug", "socket.io-client:*");

// Check connection details
console.log(notificationSocket.getConnectionStatus());
```

## Future Enhancements

1. **Offline Support**: Queue notifications ketika offline
2. **Push Notifications**: Browser push notification integration
3. **Message Queuing**: Reliable message delivery
4. **Analytics**: Connection quality metrics
5. **Custom Transports**: WebRTC atau custom transport protocols

## Migration Guide

Jika upgrading dari implementasi lama:

1. Replace existing WebSocket logic dengan `notificationSocket` service
2. Update NotificationContext untuk use new service
3. Add connection status indicators ke UI
4. Test thoroughly dengan various network conditions
5. Update environment variables sesuai kebutuhan

## Support

Untuk debugging atau issues:

1. Check browser console logs
2. Verify WebSocket connection di Network tab
3. Test dengan NotificationTester component
4. Review server logs untuk connection issues
