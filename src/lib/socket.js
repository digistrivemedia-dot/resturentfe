import { io } from "socket.io-client";
import { getToken } from "./tokenManager";

// Derive socket URL from the API URL (strip /api/v1)
const SOCKET_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1\/?$/, "");

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token: getToken() },
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 10,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
