// lib/socketHandler.js
import { io } from "socket.io-client";

/**
 * Initialize a socket.io connection and set up event handlers.
 * @param {Object} options
 * @param {string} options.SOCKET_URL - The socket server URL.
 * @param {number|string} options.userId - Current user ID.
 * @param {number|string} options.targetUserId - Chat partner's user ID.
 * @param {function} options.onReceive - Handler for receive_message event.
 * @param {function} options.onSent - Handler for message_sent event.
 * @param {function} [options.onMessageRead] - Handler for message_read event. // <-- BARU
 * @param {function} options.onConnect - Handler for connect event.
 * @param {function} options.onDisconnect - Handler for disconnect event.
 * @param {function} options.onConnectError - Handler for connect_error event.
 * @returns {Object} { socket, cleanup }
 */
export function setupChatSocket({
  SOCKET_URL,
  userId,
  targetUserId,
  onReceive,
  onSent,
  onMessageRead, // <-- BARU
  onConnect,
  onDisconnect,
  onConnectError,
}) {
  let socket;

  const initSocket = () => {
    console.log("[socketHandler] Inisialisasi socket:", { SOCKET_URL });
    socket = io(SOCKET_URL, {
      withCredentials: true, // Tetap seperti ini untuk HttpOnly cookie
      transports: ["websocket"],
    });

    socket.on("connect", (...args) => {
      console.log("[socketHandler] Socket connected", socket.id, { SOCKET_URL });
      onConnect && onConnect(...args);
    });
    socket.on("disconnect", (...args) => {
      console.log("[socketHandler] Socket disconnected");
      onDisconnect && onDisconnect(...args);
    });

    // Message receive handler (DIKEMBALIKAN KE LOGIKA ASLI ANDA)
    const handleReceive = (msg) => {
      console.log("[socketHandler] receive_message", msg);
      if (msg.sender_id === targetUserId || msg.receiver_id === targetUserId) {
        onReceive && onReceive(msg, socket);
      }
    };
    socket.on("receive_message", handleReceive);

    // Message sent handler (DIKEMBALIKAN KE LOGIKA ASLI ANDA)
    const handleSent = (msg) => {
      console.log("[socketHandler] message_sent", msg);
      if (msg.sender_id === userId && msg.receiver_id === targetUserId) {
        onSent && onSent(msg, socket);
      }
    };
    socket.on("message_sent", handleSent);

    // Message read handler (pesan kita dibaca oleh penerima)
    // SANGAT PENTING: Ganti "messege_read" jika nama event dari backend berbeda (misal "message_read")
    const handleMessageReadPayload = (payload) => {
      // payload: { message_id, user_id (yang membaca) }
      console.log("[socketHandler] messege_read (atau message_read) event received", payload);
      if (onMessageRead) {
        // Teruskan payload ke komponen, biarkan komponen yang filter relevansinya
        onMessageRead(payload);
      }
    };
    socket.on("message_read", handleMessageReadPayload); // <-- SESUAIKAN NAMA EVENT DENGAN BACKEND

    // Handler untuk connect_error
    socket.on("connect_error", (err) => {
      console.error("[socketHandler] connect_error", err);
      onConnectError && onConnectError(err);
    });

    // Simpan reference handler buat clean-up
    socket._handlers = { handleReceive, handleSent, handleMessageRead: handleMessageReadPayload, onConnect, onDisconnect, onConnectError };
    return socket;
  };

  // Clean-up function
  const cleanup = () => {
    if (!socket) return;
    const { handleReceive, handleSent, handleMessageRead, onConnect, onDisconnect, onConnectError } = socket._handlers || {};
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.off("connect_error", onConnectError);
    socket.off("receive_message", handleReceive);
    socket.off("message_sent", handleSent);
    socket.off("message_read", handleMessageRead); // <-- SESUAIKAN NAMA EVENT DENGAN BACKEND
    socket.disconnect();
    socket = null;
    console.log("[socketHandler] Socket cleaned up");
  };

  socket = initSocket();

  return { socket, cleanup };
}
