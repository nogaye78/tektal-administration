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
// CLOUDINARY
// ✅ URL originale stockée — pas de transformation à l'upload
// ✅ La conversion H264 est appliquée dans VideoPlayer à la lecture
// ===========================
export const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "tektal_videos");
  fd.append("resource_type", "video");
  // ✅ Pas de eager — non supporté avec preset non signé

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload",
    { method: "POST", body: fd }
  );
  const data = await res.json();

  if (!data.secure_url) {
    throw new Error(data.error?.message || "Upload échoué");
  }

  // ✅ URL propre sans transformation forcée
  // VideoPlayer applique /vc_h264,ac_aac,f_mp4/ à la lecture
  return {
    secure_url: data.secure_url,
    duration: Math.round(data.duration || 60),
  };
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
  const response = await pathsApi.post("paths/create/", {
    ...formData,
    platform: "web",
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

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
// PATHS ÉTABLISSEMENT
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

export const deleteEtablissementPath = async (id) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/admin-panel/api/etablissement/paths/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const hideEtablissementPath = async (id) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/admin-panel/api/etablissement/paths/${id}/hide/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// ===========================
// ÉTABLISSEMENT PROFILE
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
  const response = await api.post(`users/${id}/toggle-etablissement/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ===========================
// ÉTABLISSEMENTS
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