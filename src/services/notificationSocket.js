// services/notificationSocket.js
import { io } from "socket.io-client";
import { toast } from "sonner";

class NotificationSocket {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.onNewNotificationCallbacks = [];
    this.onConnectionChangeCallbacks = [];
    
    // Audio properties
    this.audioContext = null;
    this.hasUserInteracted = false;
    this.audioBuffer = null;
    
    // Initialize audio on first user interaction
    this.initializeAudioOnInteraction();
  }

  // Initialize audio on first user interaction
  initializeAudioOnInteraction() {
    const handleFirstInteraction = () => {
      this.hasUserInteracted = true;
      
      // Try to initialize audio context
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Preload notification sound
        this.preloadNotificationSound();
        
        console.log("📱 Audio initialized after user interaction");
      } catch (error) {
        console.warn("Failed to initialize audio context:", error);
      }
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Listen for first user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  }
  // Preload notification sound
  async preloadNotificationSound() {
    try {
      const response = await fetch('/sounds/notification.mp3');
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log("🔊 Notification sound preloaded");
      } else {
        console.warn("Notification sound file not found, will use synthetic sound");
        this.createSyntheticAudioBuffer();
      }
    } catch (error) {
      console.warn("Failed to preload notification sound, using synthetic sound:", error);
      this.createSyntheticAudioBuffer();
    }
  }

  // Create synthetic notification sound
  createSyntheticAudioBuffer() {
    if (!this.audioContext) return;
    
    try {
      // Create a short beep sound (0.2 seconds)
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.2;
      const length = sampleRate * duration;
      
      this.audioBuffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = this.audioBuffer.getChannelData(0);
      
      // Create a pleasant notification beep (two-tone)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // First tone at 800Hz, second at 1000Hz
        const freq1 = t < 0.1 ? 800 : 1000;
        const envelope = Math.exp(-t * 8); // Exponential decay
        data[i] = Math.sin(2 * Math.PI * freq1 * t) * envelope * 0.3;
      }
      
      console.log("🔊 Synthetic notification sound created");
    } catch (error) {
      console.warn("Failed to create synthetic audio buffer:", error);
    }
  }

  // Connect to WebSocket server
  connect() {
    if (this.socket && this.socket.connected) {
      console.log("⚠️ Socket already connected");
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
    console.log("🔌 Connecting to notification server:", socketUrl);

    this.socket = io(socketUrl, {
      withCredentials: true, // Untuk mengirim cookies (accessToken)
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: this.maxReconnectDelay,
      timeout: 20000,
      forceNew: false,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Connected to notification server");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      this.notifyConnectionChange(true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from notification server:", reason);
      this.isConnected = false;
      this.notifyConnectionChange(false);

      // Auto-reconnect for certain disconnect reasons
      if (reason === "io server disconnect") {
        // Server initiated disconnect, try to reconnect manually
        setTimeout(() => this.attemptReconnect(), this.reconnectDelay);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error.message);
      this.isConnected = false;
      this.reconnectAttempts++;

      // Exponential backoff for reconnection delay
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached");
        toast.error("Unable to connect to notification server. Please refresh the page.");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      toast.success("Notification connection restored");
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection error:", error.message);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("❌ Failed to reconnect to notification server");
      toast.error("Failed to reconnect to notification server");
    });

    // 🔔 LISTEN FOR REAL-TIME NOTIFICATIONS
    this.socket.on("receive_notification", (notification) => {
      console.log("📨 New notification received:", notification);
      this.handleNewNotification(notification);
    });

    // Listen for test notifications (development only)
    this.socket.on("test_notification", (notification) => {
      console.log("🧪 Test notification received:", notification);
      this.handleNewNotification(notification);
    });

    // Handle token refresh if needed
    this.socket.on("refresh_tokens", (tokens) => {
      console.log("🔄 Tokens refreshed via WebSocket");
      // Note: Using HttpOnly cookies, no manual token handling needed
    });

    // Handle server maintenance/shutdown notifications
    this.socket.on("server_maintenance", (data) => {
      console.warn("🔧 Server maintenance:", data.message);
      toast.warning(data.message || "Server maintenance in progress");
    });
  }

  // Manual reconnection attempt
  attemptReconnect() {
    if (this.isConnected || !this.socket) return;

    console.log(`🔄 Attempting manual reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    this.socket.connect();
  }

  // Handle incoming notifications
  handleNewNotification(notification) {
    try {
      // 1. Update notification badge count
      this.updateNotificationBadge();

      // 2. Show toast/popup notification
      this.showToastNotification(notification);

      // 3. Update notification list if user is viewing it
      this.updateNotificationList(notification);

      // 4. Play notification sound (optional)
      this.playNotificationSound();

      // 5. Notify registered callbacks
      this.onNewNotificationCallbacks.forEach((callback) => {
        try {
          callback(notification);
        } catch (error) {
          console.error("Error in notification callback:", error);
        }
      });
    } catch (error) {
      console.error("Error handling new notification:", error);
    }
  }

  // Update notification badge count
  updateNotificationBadge() {
    // Trigger your notification count update
    window.dispatchEvent(new CustomEvent("notificationReceived"));
  }
  // Show toast notification
  showToastNotification(notification) {
    try {
      const message = this.formatNotificationMessage(notification);
      const title = this.getNotificationTitle(notification.type);
      const icon = this.getNotificationIcon(notification.type);
      // Use plain string for toast (no JSX)
      toast(`${icon} ${title}: ${message}`, {
        duration: 5000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Error showing toast notification:", error);
    }
  }

  // Get notification title
  getNotificationTitle(type) {
    const titles = {
      like: "Post Liked",
      comment: "New Comment",
      reply: "Comment Reply",
      follow: "New Follower",
      message: "New Message",
      post_bookmarked: "Post Bookmarked",
      achievement_unlocked: "Achievement Unlocked!",
      level_up: "Level Up!",
      exp_gain: "EXP Gained",
      challenge_winner: "Challenge Winner!",
      challenge_badge: "Badge Earned!",
      challenge_deadline: "Challenge Deadline",
      post_leaderboard: "Trending Post!",
      post_featured: "Post Featured!",
      mention: "You were mentioned",
      system: "System Notification",
    };
    return titles[type] || "New Notification";
  }

  // Format notification message
  formatNotificationMessage(notification) {
    const { type, data } = notification;
    const notificationData = data || {};
    const senderUsername = notificationData.sender_username || notificationData.from_username || "";

    switch (type) {
      case "like":
        return `${senderUsername} liked your post`;
      case "comment":
        return `${senderUsername} commented on your post`;
      case "reply":
        return `${senderUsername} replied to your comment`;
      case "follow":
        return `${senderUsername} started following you`;
      case "message":
        return `${senderUsername} sent you a message`;
      case "post_bookmarked":
        return `${senderUsername} bookmarked your post`;
      case "achievement_unlocked":
        return `You unlocked "${notificationData.achievement_name}" achievement!`;
      case "level_up":
        return `Congratulations! You reached level ${notificationData.new_level}`;
      case "exp_gain":
        return notificationData.message || `+${notificationData.exp_amount} EXP gained`;
      case "challenge_winner":
        return `You won ${notificationData.rank}${this.getOrdinalSuffix(notificationData.rank)} place!`;
      case "challenge_badge":
        return `You earned "${notificationData.badge_name}" badge!`;
      case "challenge_deadline":
        return `Challenge ends in ${notificationData.hours_remaining} hours!`;
      case "post_leaderboard":
        return `Your post is trending!`;
      case "post_featured":
        return `Your post has been featured!`;
      case "mention":
        return `${senderUsername} mentioned you`;
      case "system":
        return notificationData.message || "System notification";
      default:
        return notificationData.message || "New notification";
    }
  }

  // Get ordinal suffix for numbers
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  // Get notification icon
  getNotificationIcon(type) {
    const icons = {
      like: "❤️",
      comment: "💬",
      reply: "↩️",
      follow: "👥",
      message: "📩",
      post_bookmarked: "🔖",
      achievement_unlocked: "🏆",
      level_up: "⬆️",
      exp_gain: "⭐",
      challenge_winner: "🥇",
      challenge_badge: "🏅",
      challenge_deadline: "⏰",
      post_leaderboard: "📈",
      post_featured: "✨",
      mention: "📌",
      system: "🔔",
    };
    return icons[type] || "🔔";
  }

  // Update notification list
  updateNotificationList(notification) {
    // If user is viewing notification page, add new notification to top
    const event = new CustomEvent("newNotification", {
      detail: notification,
    });
    window.dispatchEvent(event);
  }
  // Play notification sound
  playNotificationSound() {
    // Only if user has enabled sounds and interacted with the page
    if (!this.getSoundPreference() || !this.hasUserInteracted) {
      return;
    }

    try {
      // Method 1: Use Web Audio API with preloaded buffer (best quality, most reliable)
      if (this.audioContext && this.audioBuffer && this.audioContext.state === 'running') {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.audioBuffer;
        gainNode.gain.value = 0.3; // Set volume
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
        
        console.log("🔊 Played notification sound via Web Audio API");
        return;
      }
      
      // Method 2: Use HTML5 Audio with user gesture (fallback)
      this.playWithHtmlAudio();
      
    } catch (error) {
      console.warn("Could not play notification sound:", error);
      
      // Method 3: Final fallback - try simple HTML audio
      this.playWithSimpleAudio();
    }
  }
  // Fallback method using HTML5 Audio
  playWithHtmlAudio() {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.3;
      audio.preload = "auto";
      
      // Handle loading errors (file not found)
      audio.addEventListener('error', (e) => {
        console.warn("Audio file not found, creating synthetic beep");
        this.playSyntheticBeep();
      });
      
      // Handle promise-based play
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("🔊 Played notification sound via HTML Audio");
          })
          .catch((error) => {
            // If still failing, it might be due to no user interaction
            if (error.name === 'NotAllowedError') {
              console.warn("🔇 Audio autoplay blocked - user needs to interact with the page first");
              this.showAudioPermissionNotice();
            } else {
              console.warn("Audio playback failed, trying synthetic beep:", error);
              this.playSyntheticBeep();
            }
          });
      }
    } catch (error) {
      console.warn("HTML Audio fallback failed:", error);
      this.playSyntheticBeep();
    }
  }

  // Play synthetic beep using Web Audio API
  playSyntheticBeep() {
    if (!this.hasUserInteracted) {
      this.showAudioPermissionNotice();
      return;
    }

    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency and volume
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      // Play the beep
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      console.log("🔊 Played synthetic notification beep");
    } catch (error) {
      console.warn("Failed to play synthetic beep:", error);
    }
  }
  // Simple audio fallback
  playWithSimpleAudio() {
    try {
      const audio = document.createElement('audio');
      audio.src = "/sounds/notification.mp3";
      audio.volume = 0.3;
      
      // Handle loading errors
      audio.addEventListener('error', (e) => {
        console.warn("Audio file not found in simple fallback, using synthetic beep");
        this.playSyntheticBeep();
      });
      
      audio.play().catch(e => {
        console.warn("Simple audio fallback failed:", e);
        this.playSyntheticBeep();
      });
    } catch (error) {
      console.warn("Simple audio creation failed:", error);
      this.playSyntheticBeep();
    }
  }
  // Show notice about audio permission
  showAudioPermissionNotice() {
    // Only show this notice once per session
    if (!sessionStorage.getItem('audioPermissionNoticeShown')) {
      console.info("💡 Tip: Click anywhere on the page to enable notification sounds");
      sessionStorage.setItem('audioPermissionNoticeShown', 'true');
      
      // Show a user-friendly toast
      toast.info("Click anywhere to enable notification sounds", {
        duration: 3000,
        position: "bottom-right"
      });
    }
  }
  // Check user sound preference
  getSoundPreference() {
    // Default to enabled, but respect user's choice
    const preference = localStorage.getItem("notificationSound");
    if (preference === null) {
      // First time - default to enabled
      localStorage.setItem("notificationSound", "true");
      return true;
    }
    return preference === "true";
  }

  // Set sound preference
  setSoundPreference(enabled) {
    localStorage.setItem("notificationSound", enabled.toString());
    console.log(`🔊 Notification sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Public method to manually initialize audio (called on user interaction)
  async initializeAudio() {
    this.hasUserInteracted = true;
    
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Preload notification sound
      await this.preloadNotificationSound();
      
      console.log("📱 Audio manually initialized");
      return true;
    } catch (error) {
      console.warn("Failed to manually initialize audio:", error);
      return false;
    }
  }

  // Get audio system status
  getAudioStatus() {
    return {
      hasUserInteracted: this.hasUserInteracted,
      audioContextState: this.audioContext?.state || 'no-context',
      audioBufferLoaded: !!this.audioBuffer,
      soundEnabled: this.getSoundPreference(),
    };
  }

  // Register callback for new notifications
  onNewNotification(callback) {
    this.onNewNotificationCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.onNewNotificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.onNewNotificationCallbacks.splice(index, 1);
      }
    };
  }

  // Register callback for connection changes
  onConnectionChange(callback) {
    this.onConnectionChangeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.onConnectionChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onConnectionChangeCallbacks.splice(index, 1);
      }
    };
  }

  // Notify connection change
  notifyConnectionChange(isConnected) {
    this.onConnectionChangeCallbacks.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error("Error in connection change callback:", error);
      }
    });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Emit event to server
  emit(event, data) {
    if (this.isConnected && this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn("Cannot emit event: Socket not connected");
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting from notification server");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Force reconnect
  forceReconnect() {
    if (this.socket) {
      this.disconnect();
    }
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

// Export singleton instance
export default new NotificationSocket();
