import axios from "axios";

const BASE_URL = "https://tektal-backend.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/admin-panel/api/`,
});

const pathsApi = axios.create({
  baseURL: `${BASE_URL}/api/`,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/api/token/refresh/`, { refresh });
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

export const login = async (email, password) => {
  try {
    const tokenRes = await axios.post(`${BASE_URL}/api/auth/jwt/create/`, {
      email,
      password,
    });
    const { access, refresh } = tokenRes.data;
    const profileRes = await axios.get(`${BASE_URL}/api/auth/users/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    const user = profileRes.data;
    if (user.role !== "admin") {
      throw new Error("Acces reserve aux administrateurs.");
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

// ✅ Utilise admin-panel qui retourne TOUS les parcours
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
  const response = await api.post(`users/${id}/toggle-admin/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};