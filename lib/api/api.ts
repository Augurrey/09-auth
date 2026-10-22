import axios from "axios";
const origin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const api = axios.create({
  baseURL: origin ? `${origin}/api` : "/api",
  withCredentials: true,
});
