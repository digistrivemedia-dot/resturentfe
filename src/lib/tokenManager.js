// Simple in-memory token store — breaks the circular dep between api.js ↔ authStore.js
let _token = null;

export const getToken = () => _token;
export const setToken = (token) => { _token = token; };
export const clearToken = () => { _token = null; };
