// chat.jsx (ChatWindow component part)
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card"; // Asumsi ini dari ChatList
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Check, CheckCheck } from "lucide-react"; // <-- BARU: Check, CheckCheck
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { setupChatSocket } from "../lib/socketHandler";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
// Fungsi getWIBDateParts dan formatDateLabel DIASUMSIKAN SUDAH BENAR DARI KODE ASLI ANDA
// ... (Salin fungsi getWIBDateParts dan formatDateLabel dari kode asli Anda ke sini) ...
const WIB_TIMEZONE = "Asia/Jakarta";

function getWIBDateParts(dateInput) {
  let d;
  if (typeof dateInput === "string") {
    const match = dateInput.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, yearS, monthS, dayS, hourS, minuteS, secondS] = match;
      const isoWIBString = `${yearS}-${monthS}-${dayS}T${hourS}:${minuteS}:${secondS}+07:00`;
      d = new Date(isoWIBString);
      if (isNaN(d.getTime())) {
        d = new Date(dateInput.replace(" ", "T"));
      }
    } else {
      d = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    d = new Date();
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

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

// KEMBALIKAN getAvatarUrl ke versi ASLI ANDA (dari ChatList)
const getAvatarUrl = (avatarPath, defaultPath = "storage/avatars/noimage.png") => {
  if (!avatarPath) return (api.defaults.baseURL || "") + "/" + defaultPath;
  if (avatarPath.startsWith("http")) return avatarPath;
  const baseUrl = api.defaults.baseURL || "";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanAvatarPath = avatarPath.startsWith("/") ? avatarPath.substring(1) : avatarPath;
  return `${cleanBaseUrl}/${cleanAvatarPath}`;
};

// --- ChatList component (TIDAK ADA PERUBAHAN DARI KODE ASLI ANDA) ---
function ChatList({ userId, onSelect, selectedUserId }) {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const searchContainerRef = useRef(null);
  const SEARCH_LIMIT = 10;

  useEffect(() => {
    if (!userId) return;
    api.get("/chats").then(async (res) => {
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const chatList = res.data.data;
        const chatsWithProfile = await Promise.all(
          chatList.map(async (chat) => {
            try {
              const profileRes = await api.get(`/profiles/mini-profile/${chat.user_id}`);
              if (profileRes.data && profileRes.data.success) {
                return {
                  ...chat,
                  username: profileRes.data.data.username,
                  avatar: profileRes.data.data.avatar,
                };
              }
            } catch (e) {
              console.error(`Failed to fetch profile for user_id ${chat.user_id}`, e);
            }
            return { ...chat, username: `User ${chat.user_id}`, avatar: null };
          })
        );
        setChats(chatsWithProfile);
      }
    });
  }, [userId]);

  useEffect(() => {
    setSearchPage(1);
    setSearchResults([]);
    setSearchHasMore(false);
  }, [search]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setSearchError("");
      setSearchHasMore(false);
      return;
    }
    setSearchLoading(true);
    setSearchError("");
    api
      .get(`/users/search?query=${encodeURIComponent(search.trim())}&page=${searchPage}&limit=${SEARCH_LIMIT}`)
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setSearchResults((prev) => (searchPage === 1 ? res.data.data : [...prev, ...res.data.data]));
          setSearchHasMore(res.data.data.length === SEARCH_LIMIT);
        } else {
          if (searchPage === 1) setSearchResults([]);
          setSearchHasMore(false);
        }
      })
      .catch(() => {
        if (searchPage === 1) setSearchResults([]);
        setSearchError("Gagal mencari user");
        setSearchHasMore(false);
      })
      .finally(() => setSearchLoading(false));
  }, [search, searchPage]);

  useEffect(() => {
    if (!search) return;
    const container = searchContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 20 && !searchLoading && searchHasMore) {
        setSearchPage((prev) => prev + 1);
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [search, searchLoading, searchHasMore]);

  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("chat_list_update", (data) => {
      setChats((prevChats) => {
        const idx = prevChats.findIndex((c) => c.user_id === data.user_id);
        if (idx !== -1) {
          // Update chat yang sudah ada
          const updated = [...prevChats];
          updated[idx] = {
            ...updated[idx],
            last_message: data.last_message,
            last_message_time: data.last_message_time,
            unread_count: data.unread_count,
          };
          return updated;
        } else {
          // Jika belum ada, fetch ulang (atau tambahkan baru)
          return prevChats;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="h-full overflow-y-auto border-r bg-muted/50 w-72 flex-shrink-0">
      <div className="p-4 font-bold text-lg">Chats</div>
      <div className="px-4 pb-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user by username..." />
      </div>
      {search && (
        <div ref={searchContainerRef} style={{ maxHeight: 300, overflowY: "auto" }}>
          {searchResults.length > 0 && (
            <div className="border-b pb-2 mb-2">
              {searchResults.map((userResult) => (
                <div
                  key={userResult.id}
                  className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-muted ${selectedUserId === userResult.id ? "bg-muted" : ""}`}
                  onClick={() => {
                    setSearch("");
                    setSearchResults([]);
                    onSelect(userResult.id);
                  }}
                >
                  <img src={getAvatarUrl(userResult.avatar)} alt={userResult.username} className="h-8 w-8 rounded-full object-cover border" />
                  <div className="flex-1">
                    <div className="font-medium">{userResult.username}</div>
                    <div className="text-xs text-muted-foreground truncate">{userResult.first_name || "-"}</div>
                  </div>
                </div>
              ))}
              {searchLoading && <div className="px-4 text-muted-foreground text-sm">Loading...</div>}
              {!searchLoading && searchHasMore && <div className="px-4 text-muted-foreground text-sm">Scroll to load more...</div>}
            </div>
          )}
          {searchLoading && searchResults.length === 0 && <div className="px-4 text-muted-foreground text-sm">Searching...</div>}
          {searchError && <div className="px-4 text-red-500 text-sm">{searchError}</div>}
          {search && searchResults.length === 0 && !searchLoading && !searchError && <div className="px-4 text-muted-foreground text-sm">No user found.</div>}
        </div>
      )}
      {userId && chats.length === 0 && !search && <div className="p-4 text-muted-foreground">No chats available or still loading...</div>}
      {!userId && <div className="p-4 text-muted-foreground">Please log in to see chats.</div>}
      {chats.map((chat, idx) => (
        <div key={chat.user_id || chat.id || idx} className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${selectedUserId === chat.user_id ? "bg-muted" : ""}`} onClick={() => onSelect(chat.user_id)}>
          <img src={getAvatarUrl(chat.avatar)} alt={chat.username} className="h-10 w-10 rounded-full object-cover border" />
          <div className="flex-1">
            <div className="font-medium">{chat.username}</div>
            <div className="text-xs text-muted-foreground truncate">{chat.last_message}</div>
          </div>
          {/* BARU: Tampilkan unread_count jika ada dari API /chats */}
          {chat.unread_count > 0 && <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{chat.unread_count > 9 ? "9+" : chat.unread_count}</span>}
        </div>
      ))}
    </div>
  );
}

function ChatWindow({ userId, targetUserId, onRefreshAccessToken }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null); // Tetap seperti kode asli
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const messagesEndRef = useRef(null);

  // useEffect untuk setup dan cleanup socket (TETAP SEPERTI KODE ASLI ANDA, HANYA TAMBAH onMessageRead)
  useEffect(() => {
    if (!userId || !targetUserId) {
      if (socket) {
        // Jika socket sudah ada dari user/target sebelumnya, disconnect
        socket.disconnect();
        setSocket(null);
        setIsSocketConnected(false);
      }
      setMessages([]); // Bersihkan pesan jika tidak ada targetUserId
      return; // Jangan setup socket jika tidak ada userId atau targetUserId
    }

    const { socket: s, cleanup: clean } = setupChatSocket({
      SOCKET_URL,
      userId,
      targetUserId,
      onReceive: (msg, sockInstance) => {
        console.log("[ChatWindow] onReceive", msg);
        if (msg.created_at && typeof msg.created_at === "string" && msg.created_at.includes(" ")) {
          msg.created_at = msg.created_at.replace(" ", "T");
        }
        const receivedMsg = { ...msg, is_read: !!msg.is_read };
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === receivedMsg.id);
          if (exists) {
            return prev.map((m) => (m.id === receivedMsg.id ? receivedMsg : m));
          }
          return [...prev, receivedMsg];
        });
        // Emit mark_as_read jika pesan untuk user login, dari targetUser, dan belum dibaca
        if (receivedMsg.receiver_id === userId && receivedMsg.sender_id === targetUserId && !receivedMsg.is_read && sockInstance) {
          console.log("[ChatWindow] Emit mark_as_read", receivedMsg.id, "sender_id:", receivedMsg.sender_id);
          sockInstance.emit("mark_as_read", { message_id: receivedMsg.id, sender_id: receivedMsg.sender_id });
        }
      },
      onSent: (msg) => {
        console.log("[ChatWindow] onSent", msg);
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
        console.log("[ChatWindow] onMessageRead", payload, "targetUserId:", targetUserId);
        // payload: { message_id, reader_id (yang membaca) }
        // Jika pesan milik user login (sender) dan dibaca oleh targetUser (receiver)
        if (payload.reader_id === parseInt(targetUserId)) {
          setMessages((prev) => prev.map((m) => (m.id === payload.message_id ? { ...m, is_read: true } : m)));
        }
      },
      onConnect: () => setIsSocketConnected(true),
      onDisconnect: () => setIsSocketConnected(false),
      onConnectError: (err, info) => {
        setIsSocketConnected(false);
        console.error("[ChatWindow] connect_error", err, info);
        // Anda bisa menambahkan alert atau notifikasi jika diperlukan
      },
    });
    setSocket(s);
    return clean;
  }, [userId, targetUserId, onRefreshAccessToken]); // Dependensi socket dihilangkan karena di-set di sini

  useEffect(() => {
    if (!targetUserId) return setTargetUser(null);
    setTargetUser(null);
    api
      .get(`/profiles/mini-profile/${targetUserId}`)
      .then((res) => {
        if (res.data && res.data.success) setTargetUser(res.data.data);
        else setTargetUser(null);
      })
      .catch(() => setTargetUser(null));
  }, [targetUserId]);

  useEffect(() => {
    if (!userId || !targetUserId) return setMessages([]);
    setLoading(true);
    api
      .get(`/chats/history/${targetUserId}`)
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const sortedMessages = res.data.data.sort((a, b) => {
            try {
              const dateA = new Date(a.created_at);
              const dateB = new Date(b.created_at);
              if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0; // Keep original order if dates are invalid
              }
              return dateA.getTime() - dateB.getTime();
            } catch (error) {
              console.warn("Error sorting messages by date:", error);
              return 0;
            }
          });
          // BARU: Konversi is_read dari 0/1 (API) ke boolean
          const normalizedMessages = sortedMessages.map((msg) => ({
            ...msg,
            is_read: !!msg.is_read, // 0 -> false, 1 -> true
          }));
          setMessages(normalizedMessages);
          // --- Tambahan: Mark as read semua pesan yang belum dibaca dari targetUser ---
          if (socket) {
            normalizedMessages.forEach((msg) => {
              if (msg.receiver_id === userId && msg.sender_id === targetUserId && !msg.is_read) {
                console.log("[ChatWindow] Mark as read (history)", msg.id, "sender_id:", msg.sender_id);
                socket.emit("mark_as_read", { message_id: msg.id, sender_id: msg.sender_id });
              }
            });
          }
        } else setMessages([]);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [userId, targetUserId, socket]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !userId || !socket || !targetUserId || !isSocketConnected) return;
    setSending(true);
    try {
      socket.emit("send_message", { receiver_id: targetUserId, content: input.trim() }, (ack) => {
        setSending(false);
        if (ack && ack.error) {
          alert("Gagal mengirim pesan: " + (ack.error.message || ack.error));
        } else {
          // Tidak ada error, atau ada ack.message (sukses)
          setInput(""); // Kosongkan input
        }
      });
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

  if (!targetUserId) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground text-lg">Select a chat to start messaging</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {" "}
      <div className="flex items-center gap-3 border-b p-4 bg-background">
        {targetUser ? (
          <>
            <img
              src={getAvatarUrl(targetUser.avatar)}
              alt={targetUser.username || "User"}
              className="h-10 w-10 rounded-full border object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/profile/${targetUserId}`)}
            />
            <div className="font-semibold cursor-pointer hover:underline transition-all" onClick={() => navigate(`/profile/${targetUserId}`)}>
              {targetUser.username || targetUser.first_name || "User"}
            </div>
          </>
        ) : (
          <div className="font-semibold">Loading user...</div>
        )}
        {/* Indikator koneksi socket DIHAPUS */}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted">
        {" "}
        {/* KEMBALIKAN KE bg-muted */}
        {loading ? (
          <div className="text-center text-muted-foreground">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground">No messages yet. Start the conversation!</div>
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
              const isMyMessage = msg.sender_id === userId;
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
                      {msg.content}{" "}
                      <div className={`text-[10px] text-right mt-1 flex items-center justify-end gap-1 ${isMyMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        <span>
                          {(() => {
                            try {
                              const date = new Date(msg.created_at);
                              if (isNaN(date.getTime())) {
                                return "00:00";
                              }
                              return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            } catch (error) {
                              return "00:00";
                            }
                          })()}{" "}
                        </span>
                        {isMyMessage &&
                          msg.id && // Tampilkan ikon hanya jika pesan punya ID
                          (msg.is_read ? <CheckCheck size={14} className="text-blue-900" /> : <Check size={14} className="text-blue-800" />)}
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
        className="flex items-center gap-2 p-4 border-t"
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
    </div>
  );
}

// --- ChatPage component ---
export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userId, setUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Get user parameter from URL
  const userFromUrl = searchParams.get("user");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id) setUserId(parsedUser.id);
      } catch (error) {
        console.error("ChatPage: Error parsing userData:", error);
      }
    }
  }, []);

  // Set selected user from URL parameter
  useEffect(() => {
    if (userFromUrl && !isNaN(userFromUrl)) {
      const targetUserId = parseInt(userFromUrl, 10);
      setSelectedUserId(targetUserId);
    }
  }, [userFromUrl]);

  // Update URL when selected user changes
  const handleUserSelect = (targetUserId) => {
    setSelectedUserId(targetUserId);

    // Update URL with user parameter
    const newSearchParams = new URLSearchParams(searchParams);
    if (targetUserId) {
      newSearchParams.set("user", targetUserId.toString());
    } else {
      newSearchParams.delete("user");
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleRefreshAccessToken = async () => {
    console.warn("handleRefreshAccessToken not implemented. Socket might fail if token expires.");
    return { accessToken: localStorage.getItem("accessToken") }; // Placeholder, sesuaikan
  };
  return (
    <div className="flex h-screen">
      <ChatList userId={userId} onSelect={handleUserSelect} selectedUserId={selectedUserId} />
      {userId ? (
        <ChatWindow userId={userId} targetUserId={selectedUserId} onRefreshAccessToken={handleRefreshAccessToken} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-lg">
          <span>Loading chat... (Authenticating user)</span>
        </div>
      )}
    </div>
  );
}
