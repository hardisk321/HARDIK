import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "drishti_admin_token";
const USER_KEY = "drishti_admin_user";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
  login: async (email, password) => {
    const { data } = await axios.post(`${API}/admin/login`, { email, password });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  authHeader: () => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? { Authorization: `Bearer ${t}` } : {};
  },
};

const client = axios.create({ baseURL: API });
client.interceptors.request.use((config) => {
  const t = auth.getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
client.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      auth.logout();
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.replace("/admin/login");
      }
    }
    return Promise.reject(error);
  }
);

export const formatApiError = (err) => {
  const d = err?.response?.data?.detail;
  if (d == null) return err?.message || "Something went wrong.";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(", ");
  if (d && typeof d.msg === "string") return d.msg;
  return String(d);
};

export default client;
