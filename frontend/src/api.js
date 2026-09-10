import axios from "axios";

// En développement, le proxy Vite redirige "/api" vers le backend local.
// En production (build déployé), on utilise l'URL complète du backend
// déployé, fournie via la variable d'environnement VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({ baseURL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cti_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cti_token");
      localStorage.removeItem("cti_user");
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default api;
