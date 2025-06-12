// ChatPopup.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Check, CheckCheck } from "lucide-react"; // <-- BARU: Check, CheckCheck
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { setupChatSocket } from "../lib/socketHandler";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const WIB_TIMEZONE = "Asia/Jakarta"; // Pastikan ini sesuai

// Fungsi getWIBDateParts dan formatDateLabel DIASUMSIKAN SUDAH BENAR DARI KODE ASLI ANDA
// ... (Salin fungsi getWIBDateParts dan formatDateLabel dari kode asli Anda ke sini) ...
function getWIBDateParts(dateInput) {
  let d;
  if (typeof dateInput === "string") {
    // Format dari backend: 'YYYY-MM-DD HH:mm:ss' (dianggap sudah WIB)
    const match = dateInput.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, yearS, monthS, dayS, hourS, minuteS, secondS] = match;
      // Buat string ISO 8601 dengan offset +07:00 agar Date() menginterpretasikannya sebagai WIB
      const isoWIBString = `${yearS}-${monthS}-${dayS}T${hourS}:${minuteS}:${secondS}+07:00`;
      d = new Date(isoWIBString);
      if (isNaN(d.getTime())) {
        console.warn(`[getWIBDateParts] Gagal parse "${dateInput}" sebagai WIB dengan offset +07:00. Mencoba parse langsung (mungkin tidak akurat untuk TZ).`);
        d = new Date(dateInput.replace(" ", "T")); // Fallback
      }
    } else {
      console.warn(`[getWIBDateParts] Format string tanggal tidak dikenal: "${dateInput}". Mencoba parse langsung.`);
      d = new Date(dateInput); // Fallback, bisa tidak reliable untuk timezone
    }
  } else if (dateInput instanceof Date) {
    d = dateInput; // Sudah objek Date
  } else {
    console.error(`[getWIBDateParts] Tipe dateInput tidak valid:`, dateInput, ". Menggunakan tanggal saat ini sebagai fallback.");
    d = new Date(); // Fallback
  }

  if (isNaN(d.getTime())) {
    console.error(`[getWIBDateParts] Objek Date tidak valid dari input: "${dateInput}". Menggunakan tanggal saat ini sebagai fallback.`);
    d = new Date(); // Fallback jika parsing gagal total
  }

  // Dapatkan komponen tanggal dalam timezone WIB
  try {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: WIB_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedDateInWIB = formatter.format(d);
    const [yearStr, monthStr, dayStr] = formattedDateInWIB.split("-");

    return {
      year: parseInt(yearStr, 10),
      month: parseInt(monthStr, 10) - 1,
      day: parseInt(dayStr, 10),
    };
  } catch (error) {
    console.error("[getWIBDateParts] Error formatting date with Intl.DateTimeFormat:", error, "Input date object:", d, "Original input:", dateInput);
    const fallbackDate = new Date();
    return {
      year: fallbackDate.getFullYear(),
      month: fallbackDate.getMonth(),
      day: fallbackDate.getDate(),
    };
  }
}

function formatDateLabel(dateStr) {
  const msgWIB = getWIBDateParts(dateStr);
  const nowWIB = getWIBDateParts(new Date());

  const msgDateUTC = Date.UTC(msgWIB.year, msgWIB.month, msgWIB.day);
  const nowDateUTC = Date.UTC(nowWIB.year, nowWIB.month, nowWIB.day);
  const diff = Math.floor((nowDateUTC - msgDateUTC) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${msgWIB.day.toString().padStart(2, "0")}/${(msgWIB.month + 1).toString().padStart(2, "0")}/${msgWIB.year}`;
}

export default function ChatPopup({ openUserId, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null); // Tetap seperti kode asli
  const [user, setUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (!openUserId) return;
    setTargetUser(null);
    api
      .get(`/profiles/mini-profile/${openUserId}`)
      .then((res) => {
        if (res.data && res.data.success) setTargetUser(res.data.data);
        else setTargetUser(null);
      })
      .catch(() => setTargetUser(null));
  }, [openUserId]);

  useEffect(() => {
    if (!openUserId) return;
    setLoading(true);
    setMessages([]);
    api
      .get(`/chats/history/${openUserId}`)
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const sortedMessages = res.data.data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          // BARU: Konversi is_read dari 0/1 (API) ke boolean
          const normalizedMessages = sortedMessages.map((msg) => ({
            ...msg,
            is_read: !!msg.is_read, // 0 -> false, 1 -> true
          }));
          setMessages(normalizedMessages);
          // --- Tambahan: Mark as read semua pesan yang belum dibaca dari openUserId ---
          if (user && socket) {
            normalizedMessages.forEach((msg) => {
              if (msg.receiver_id === user.id && msg.sender_id === openUserId && !msg.is_read) {
                console.log("[ChatPopup] Mark as read (history)", msg.id, "sender_id:", msg.sender_id);
                socket.emit("mark_as_read", { message_id: msg.id, sender_id: msg.sender_id });
              }
            });
          }
        } else setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [openUserId, user, socket]);

  useEffect(() => {
    if (!user || !openUserId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const { socket: s, cleanup } = setupChatSocket({
      SOCKET_URL,
      userId: user.id,
      targetUserId: openUserId,
      onReceive: (msg, sockInstance) => {
        if (msg.created_at && typeof msg.created_at === "string" && msg.created_at.includes(" ")) {
          msg.created_at = msg.created_at.replace(" ", "T");
        }
        const receivedMsg = { ...msg, is_read: !!msg.is_read };
        setMessages((prev) => {
          // Cek jika pesan sudah ada, replace, jika belum, tambahkan
          const exists = prev.some((m) => m.id === receivedMsg.id);
          if (exists) {
            return prev.map((m) => (m.id === receivedMsg.id ? receivedMsg : m));
          }
          return [...prev, receivedMsg];
        });
        // Emit mark_as_read jika pesan untuk user login, dari user yang sedang dibuka, dan belum dibaca
        if (receivedMsg.receiver_id === user.id && receivedMsg.sender_id === openUserId && !receivedMsg.is_read && sockInstance) {
          console.log("[ChatPopup] Emit mark_as_read", receivedMsg.id, "sender_id:", receivedMsg.sender_id);
          sockInstance.emit("mark_as_read", { message_id: receivedMsg.id, sender_id: receivedMsg.sender_id });
        }
      },
      onSent: (msg) => {
        if (msg.created_at && typeof msg.created_at === "string" && msg.created_at.includes(" ")) {
          msg.created_at = msg.created_at.replace(" ", "T");
        }
        const sentMsg = { ...msg, is_read: !!msg.is_read };
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === sentMsg.id);
          if (exists) {
            return prev.map((m) => (m.id === sentMsg.id ? sentMsg : m));
          }
          return [...prev, sentMsg];
        });
      },
      onMessageRead: (payload) => {
        // payload: { message_id, reader_id (yang membaca) }
        // Jika pesan milik user login (sender) dan dibaca oleh targetUser (receiver)
        if (payload.reader_id === parseInt(openUserId)) {
          setMessages((prev) => prev.map((m) => (m.id === payload.message_id ? { ...m, is_read: true } : m)));
        }
      },
      onConnect: () => setIsSocketConnected(true),
      onDisconnect: () => setIsSocketConnected(false),
      onConnectError: (err) => {
        setMessages([]);
        setLoading(false);
        setIsSocketConnected(false);
        alert("Gagal konek ke chat server: " + (err.message || "Token tidak valid/expired. Silakan login ulang."));
      },
    });
    setSocket(s); // Tetap menggunakan state socket
    return cleanup; // Ini akan dipanggil saat user atau openUserId berubah, atau komponen unmount
  }, [user, openUserId]); // Dependensi socket dihilangkan karena socket di-set di sini

  const sendMessage = () => {
    if (!input.trim() || !user || !socket || !openUserId || !isSocketConnected) return;
    setSending(true);
    try {
      socket.emit("send_message", { receiver_id: openUserId, content: input.trim() }, (ack) => {
        setSending(false);
        if (ack && ack.error) {
          console.error("Failed to send message:", ack.error);
          alert("Gagal mengirim pesan: " + (ack.error.message || ack.error));
        } else {
          setInput(""); // Kosongkan input setelah berhasil kirim (atau setelah 'message_sent' diterima)
        }
      });
      // input dikosongkan di atas jika ada ack.success atau jika tidak ada error
    } catch (err) {
      setSending(false);
      console.error("Socket emit error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!openUserId) return null;

  // KEMBALIKAN getAvatarUrl ke versi ASLI ANDA
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/storage/avatars/noimage.png";
    if (avatarPath.startsWith("http")) return avatarPath;
    const baseUrl = api.defaults.baseURL || "";
    return `${baseUrl}/${avatarPath.startsWith("/") ? avatarPath.substring(1) : avatarPath}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-full">
      <Card className="shadow-lg">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
          <span className="font-semibold flex items-center gap-2">
            {targetUser ? (
              <>
                <img
                  src={getAvatarUrl(targetUser.avatar)}
                  alt={targetUser.username || "User"}
                  className="h-7 w-7 rounded-full border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/profile/${openUserId}`)}
                />
                <span className="cursor-pointer hover:underline transition-all" onClick={() => navigate(`/profile/${openUserId}`)}>
                  {targetUser.username || targetUser.first_name || "User"}
                </span>
              </>
            ) : (
              "Chat"
            )}
            {/* Indikator koneksi socket DIHAPUS */}
          </span>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col h-96 p-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted">
            {" "}
            {/* KEMBALIKAN KE bg-muted */}
            {loading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground">No messages</div>
            ) : (
              (() => {
                let lastDateWIBStr = null;
                return messages.map((msg, idx) => {
                  const currentMsgDateLabel = formatDateLabel(msg.created_at);

                  let showDate = false;
                  if (lastDateWIBStr !== currentMsgDateLabel) {
                    showDate = true;
                    lastDateWIBStr = currentMsgDateLabel;
                  }
                  const isMyMessage = msg.sender_id === user?.id;
                  return (
                    <React.Fragment key={msg.id || `msg-${idx}`}>
                      {showDate && (
                        <div className="flex justify-center my-2">
                          <span className="bg-gray-300 dark:bg-gray-700 text-xs px-3 py-1 rounded-full text-gray-700 dark:text-gray-200 shadow">{currentMsgDateLabel}</span>
                        </div>
                      )}
                      <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-[70%] text-sm break-words ${isMyMessage ? "bg-primary text-primary-foreground" : "bg-white dark:bg-gray-800"}`}>
                          {" "}
                          {/* KEMBALIKAN STYLE ASLI */}
                          {msg.content}
                          <div className={`text-[10px] text-right mt-1 flex items-center justify-end gap-1 ${isMyMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            {isMyMessage &&
                              msg.id && // Tampilkan ikon hanya jika pesan punya ID (dari server)
                              (msg.is_read ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} />)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                });
              })()
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex items-center gap-2 p-2 border-t"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSocketConnected ? "Type a message..." : "Connecting to chat..."}
              className="flex-1"
              autoFocus
              disabled={sending || !isSocketConnected}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || sending || !isSocketConnected}>
              <Send />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
