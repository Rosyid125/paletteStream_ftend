# 🧠 Copilot Instruction - Frontend Workspace (Palettestream)

## 📌 Project Overview

This is a **React 19 + Vite** frontend project for a **social media platform dedicated to visual artists** (illustrators, designers, etc.).

- UI powered by **shadcn/ui** + **Radix UI**
- Styled with **Tailwind CSS**, using `clsx`, `tailwind-merge`, and `tailwindcss-animate`
- Real-time features via **Socket.io**
- API integration via **Axios instance**

---

## 🔐 Authentication Policy

- **Tokens are stored in `HttpOnly` cookies.**
- 🚫 DO NOT use `localStorage`, `sessionStorage`, or manually read cookies.
- Axios and Socket.io should send cookies automatically using:

```js
withCredentials: true;
```

---

## 🌐 API Usage

Use shared Axios instance (`api`) configured with:

```js
baseURL: import.meta.env.VITE_API_URL;
withCredentials: true;
```

✅ Use:

```ts
import api from "@/lib/api";
const res = await api.get("/posts");
```

❌ Never use:

```ts
fetch("http://localhost:3000/api/posts"); // ⛔
axios.get("https://yourdomain.com/api/posts"); // ⛔
```

---

## 🔌 Realtime Communication

All WebSocket communication uses `socket.io-client` with:

```js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});
```

✅ Never manually attach token to headers or query params.

---

## 🧩 Routing

- Uses `react-router-dom@7`
- Public: `/explore`, `/login`, `/register`
- Protected: `/home`, `/profile/:username`, `/chat/:userId`

Wrapped with `AuthProvider` + `PrivateRoute`.

---

## 🧠 State Management

- `AuthContext` → auth state and actions
- `SocketContext` → real-time communication
- `ThemeProvider` → dark/light mode (via `next-themes`)

---

## 🎨 UI Structure

- All components follow shadcn/ui structure
- Accessible via `@radix-ui/react-*`
- Animated with `framer-motion` or `tailwindcss-animate`
- Tailwind + `clsx` + `tailwind-merge` for styling

```
/components
  /ui       → button, input, alert
  /shared   → layout, navbar, avatar
  /feed     → post card, carousel
```

---

## ⚙️ Env Variables

```env
VITE_API_URL=https://yourdomain.com/api/
VITE_SOCKET_URL=wss://yourdomain.com
```

Use them via `import.meta.env.VITE_API_URL`.

---

## 💡 Copilot Guidelines

✅ Do:

- Use `api.get("/...")`
- Use `socket.emit(...)` with VITE_SOCKET_URL
- Use Tailwind + `clsx`
- Use `@shadcn/ui` components

🚫 Don’t:

- Read/write cookies manually
- Use `localStorage` for tokens
- Hardcode base URLs
- Bypass axios instance

---

## ✅ Snippets

```ts
// API call
const res = await api.post("/auth/login", payload);

// Socket event
socket.emit("send_message", {
  receiver_id: 5,
  content: "Nice drawing!",
});
```

---

## 🧪 Dev Tools

- ESLint: `npm run lint`
- Dev: `npm run dev`
- Test: Coming soon (setup using React Testing Library)

---

## 🔍 Extra Packages

- `shadcn/ui` + `@radix-ui/*` – UI
- `socket.io-client` – realtime
- `clsx`, `tailwind-merge` – styling
- `axios` – API
- `lucide-react`, `framer-motion`, `sonner`, `embla-carousel-react`

---

```

```
