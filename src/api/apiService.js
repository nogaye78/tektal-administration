import axios from "axios";

// 🔹 Backend base URL
const BASE_URL = "https://tektal-backend.onrender.com";

// Axios instances
const api = axios.create({
  baseURL: `${BASE_URL}/admin-panel/api/`,
});

const pathsApi = axios.create({
  baseURL: `${BASE_URL}/api/`,
});

// 🔹 Interceptor pour refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/api/auth/jwt/refresh/`, { refresh });
          localStorage.setItem("access_token", res.data.access);
          error.config.headers["Authorization"] = `Bearer ${res.data.access}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ===========================
// AUTHENTICATION
// ===========================
export const login = async (email, password) => {
  try {
    const tokenRes = await axios.post(`${BASE_URL}/api/auth/jwt/create/`, { email, password });
    const { access, refresh } = tokenRes.data;

    const profileRes = await axios.get(`${BASE_URL}/api/auth/users/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    const user = profileRes.data;

    // ✅ Accepte admin et etablissement
    if (user.role !== "admin" && user.role !== "etablissement") {
      throw new Error("Accès non autorisé.");
    }

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    return { access, refresh, user };
  } catch (err) {
    throw new Error(
      err.response?.data?.detail ||
      err.message ||
      "Email ou mot de passe incorrect"
    );
  }
};

// ===========================
// PATHS
// ===========================
export const fetchPaths = async () => {
  const token = localStorage.getItem("access_token");
  const response = await api.get("paths/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createPath = async (formData) => {
  const token = localStorage.getItem("access_token");
  const response = await pathsApi.post("paths/create/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const deletePath = async (id) => {
  const token = localStorage.getItem("access_token");
  await pathsApi.delete(`paths/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const approvePath = async (id) => {
  const token = localStorage.getItem("access_token");
  await api.post(`paths/approve/${id}/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectPath = async (id) => {
  const token = localStorage.getItem("access_token");
  await api.post(`paths/reject/${id}/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ===========================
// USERS
// ===========================
export const fetchConnectedUsers = async () => {
  const token = localStorage.getItem("access_token");
  const response = await api.get("users/connected/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem("access_token");
  await api.delete(`users/${id}/delete/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 🔹 Toggle rôle dynamique : admin / etablissement / participant
export const toggleUserRole = async (id, role) => {
  const token = localStorage.getItem("access_token");
  const response = await api.post(`users/${id}/toggle-role/`, { role }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 🔹 Ancienne fonction toggleAdmin (pour compatibilité)
export const toggleAdmin = async (id) => {
  return toggleUserRole(id, "admin");
};