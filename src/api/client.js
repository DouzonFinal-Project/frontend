// src/api/client.js  (Vite 기준 — CRA면 env 접근만 바꾸면 됨)
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "v1",
  timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 15000,
});

export default api;
