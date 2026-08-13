import { io } from "socket.io-client";
import { getToken } from "./tokenManager";

// Derive socket URL from the API URL (strip /api/v1)
const SOCKET_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1\/?$/, "");

let socket = null;
let socketToken = null; // token this socket was authenticated with

export const connectSocket = () => {
  const currentToken = getToken();

  // The server only authenticates a socket once, at connect time, and joins
  // it to rooms (customer:<id>, restaurant:<id>) based on that identity.
  // If the logged-in user changed since this socket connected — login,
  // logout, or switching accounts in the same tab (customer/restaurant/admin
  // all live in this one app, so that never triggers a full page reload) —
  // the stale connection stays in the PREVIOUS user's rooms and keeps
  // receiving their events. Force a fresh connection whenever the token
  // we'd authenticate with differs from the one already in use.
  if (socket && socketToken !== currentToken) {
    socket.disconnect();
    socket = null;
  }

  if (socket?.connected) return socket;

  socketToken = currentToken;
  socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token: currentToken },
    transports: ["websocket"],   // skip HTTP polling — go straight to WebSocket
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socketToken = null;
};

export const getSocket = () => socket;
