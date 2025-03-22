import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`; // Sesuaikan dengan variabel environment

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Pastikan cookies dikirim dalam setiap request
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
