import axios from 'axios';

export const api = axios.create({
  // Цяпер выкарыстоўваем API_BASE_URL, які ёсць у .env.local
  baseURL: `${process.env.API_BASE_URL}/api`,
  withCredentials: true,
});
