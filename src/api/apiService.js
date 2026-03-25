import axios from "axios";

const BASE_URL = "https://tektal-backend.onrender.com";

// Instances Axios
const api = axios.create({
  baseURL: `${BASE_URL}/admin-panel/api/`,
});

const pathsApi = axios.create({
  baseURL: `${BASE_URL}/api/`,
});

// Gestion des erreurs 401 + refresh token
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

    if (user.role !== "admin" && user.role !== "etablissement") {
      throw new Error("Acces non autorise.");
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
// PATHS ADMIN
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

// Masquer un chemin
export const hidePath = async (id) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/admin-panel/api/paths/${id}/hide/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const deletePath = async (id) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/admin-panel/api/paths/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
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
// PATHS ETABLISSEMENT
// ===========================
export const fetchEtablissementPaths = async () => {
  const token = localStorage.getItem("access_token");
  const response = await api.get("etablissement/paths/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const approveEtablissementPath = async (id) => {
  const token = localStorage.getItem("access_token");
  await api.post(`etablissement/paths/approve/${id}/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectEtablissementPath = async (id) => {
  const token = localStorage.getItem("access_token");
  await api.post(`etablissement/paths/reject/${id}/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ===========================
// ETABLISSEMENT PROFILE
// ===========================
export const fetchEtablissementProfile = async () => {
  const token = localStorage.getItem("access_token");
  const response = await api.get("etablissement/profile/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
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

export const toggleAdmin = async (id) => {
  const token = localStorage.getItem("access_token");
  const response = await api.post(`users/${id}/toggle-admin/`, { role: "admin" }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const toggleEtablissement = async (id) => {
  const token = localStorage.getItem("access_token");
  const response = await api.post(`users/${id}/toggle-etablissement/`, {}, {  // ✅ URL corrigée
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ===========================
// ETABLISSEMENTS
// ===========================
export const fetchEtablissements = async () => {
  const token = localStorage.getItem("access_token");
  const response = await api.get("etablissements/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteEtablissement = async (id) => {
  const token = localStorage.getItem("access_token");
  await api.delete(`etablissements/${id}/delete/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};