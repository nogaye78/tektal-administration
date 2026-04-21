// import axios from "axios";

// const BASE_URL = "https://tektal-backend.onrender.com";

// // =============================================
// // INSTANCE AXIOS
// // =============================================
// const api = axios.create({
//   baseURL: `${BASE_URL}/`,
// });

// // Intercepteur — ajoute le token JWT à chaque requête
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("tektal_token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Intercepteur — refresh token si 401
// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     if (error.response?.status === 401) {
//       const refresh = localStorage.getItem("tektal_refresh");
//       if (refresh) {
//         try {
//           const res = await axios.post(`${BASE_URL}/api/auth/jwt/refresh/`, { refresh });
//           localStorage.setItem("tektal_token", res.data.access);
//           error.config.headers.Authorization = `Bearer ${res.data.access}`;
//           return api.request(error.config);
//         } catch {
//           localStorage.clear();
//           window.location.href = "/login";
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// // =============================================
// // AUTH
// // =============================================
// export const login = async (email, password) => {
//   const { data } = await axios.post(`${BASE_URL}/api/auth/jwt/create/`, { email, password });
//   const profile = await axios.get(`${BASE_URL}/api/auth/users/me/`, {
//     headers: { Authorization: `Bearer ${data.access}` },
//   });
//   localStorage.setItem("tektal_token", data.access);
//   localStorage.setItem("tektal_refresh", data.refresh);
//   localStorage.setItem("user", JSON.stringify(profile.data));
//   return { token: data.access, user: profile.data };
// };

// export const logout = () => {
//   localStorage.removeItem("tektal_token");
//   localStorage.removeItem("tektal_refresh");
//   localStorage.removeItem("user");
// };

// // =============================================
// // CLOUDINARY UPLOAD — FIX VIDÉOS EN NOIR
// // =============================================
// export const uploadToCloudinary = async (file) => {
//   const fd = new FormData();
//   fd.append("file", file);
//   fd.append("upload_preset", "tektal_videos");
//   fd.append("resource_type", "video");

//   // ✅ Force la conversion H264 à l'upload
//   fd.append("eager", "vc_h264:baseline:3.0,ac_aac,f_mp4");
//   fd.append("eager_async", "false");

//   const res = await fetch(
//     "https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload",
//     { method: "POST", body: fd }
//   );
//   const data = await res.json();

//   if (!data.secure_url) {
//     throw new Error(data.error?.message || "Upload échoué");
//   }

//   // ✅ Priorité : URL eager déjà convertie > transformation forcée dans l'URL
//   const finalUrl =
//     data.eager?.[0]?.secure_url ||
//     data.secure_url
//       .replace("/upload/", "/upload/vc_h264,ac_aac,f_mp4/")
//       .replace(/\.(mov|MOV|hevc|HEVC|avi|AVI|3gp|3GP)$/, ".mp4");

//   return {
//     secure_url: finalUrl,
//     duration: Math.round(data.duration || 60),
//   };
// };

// // =============================================
// // PATHS — ADMIN
// // =============================================
// export const fetchPaths = async () => {
//   const { data } = await api.get("admin-panel/api/paths/");
//   return data;
// };

// export const approvePath = async (id) => {
//   const { data } = await api.post(`admin-panel/api/paths/${id}/approve/`);
//   return data;
// };

// export const hidePath = async (id) => {
//   const { data } = await api.post(`admin-panel/api/paths/${id}/hide/`);
//   return data;
// };

// export const deletePath = async (id) => {
//   await api.delete(`admin-panel/api/paths/${id}/delete/`);
// };

// export const createPath = async (payload) => {
//   const { data } = await api.post("admin-panel/api/paths/create/", payload);
//   return data;
// };

// // =============================================
// // PATHS — ÉTABLISSEMENT
// // =============================================
// export const fetchEtablissementPaths = async () => {
//   const { data } = await api.get("admin-panel/api/etablissement/paths/");
//   return data;
// };

// export const approveEtablissementPath = async (id) => {
//   const { data } = await api.post(`admin-panel/api/etablissement/paths/${id}/approve/`);
//   return data;
// };

// export const hideEtablissementPath = async (id) => {
//   const { data } = await api.post(`admin-panel/api/etablissement/paths/${id}/hide/`);
//   return data;
// };

// export const deleteEtablissementPath = async (id) => {
//   await api.delete(`admin-panel/api/etablissement/paths/${id}/delete/`);
// };

// // =============================================
// // ÉTABLISSEMENTS
// // =============================================
// export const fetchEtablissements = async () => {
//   const { data } = await api.get("admin-panel/api/etablissements/");
//   return data;
// };

// export const deleteEtablissement = async (id) => {
//   await api.delete(`admin-panel/api/etablissements/${id}/delete/`);
// };

// export const toggleEtablissement = async (id) => {
//   const { data } = await api.post(`admin-panel/api/users/${id}/toggle-etablissement/`);
//   return data;
// };

// // =============================================
// // UTILISATEURS
// // =============================================
// export const fetchConnectedUsers = async () => {
//   const { data } = await api.get("admin-panel/api/users/");
//   return data;
// };

// export const deleteUser = async (id) => {
//   await api.delete(`admin-panel/api/users/${id}/delete/`);
// };

// export const toggleAdminRole = async (id) => {
//   const { data } = await api.post(`admin-panel/api/users/${id}/toggle-admin/`);
//   return data;
// };








import axios from "axios";

const BASE_URL = "https://tektal-backend.onrender.com";

// =============================================
// INSTANCE AXIOS
// =============================================
const api = axios.create({
  baseURL: `${BASE_URL}/`,
});

// Intercepteur — ajoute le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tektal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur — refresh token si 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("tektal_refresh");
      if (refresh) {
        try {
          const res = await axios.post(
            `${BASE_URL}/api/auth/jwt/refresh/`,
            { refresh }
          );
          localStorage.setItem("tektal_token", res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
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

// =============================================
// AUTH
// =============================================
export const login = async (email, password) => {
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/jwt/create/`,
    { email, password }
  );

  const profile = await axios.get(
    `${BASE_URL}/api/auth/users/me/`,
    {
      headers: { Authorization: `Bearer ${data.access}` },
    }
  );

  localStorage.setItem("tektal_token", data.access);
  localStorage.setItem("tektal_refresh", data.refresh);
  localStorage.setItem("user", JSON.stringify(profile.data));

  return { token: data.access, user: profile.data };
};

export const logout = () => {
  localStorage.removeItem("tektal_token");
  localStorage.removeItem("tektal_refresh");
  localStorage.removeItem("user");
};

// =============================================
// CLOUDINARY UPLOAD
// =============================================
export const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "tektal_videos");
  fd.append("resource_type", "video");

  fd.append("eager", "vc_h264:baseline:3.0,ac_aac,f_mp4");
  fd.append("eager_async", "false");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload",
    { method: "POST", body: fd }
  );

  const data = await res.json();

  if (!data.secure_url) {
    throw new Error(data.error?.message || "Upload échoué");
  }

  const finalUrl =
    data.eager?.[0]?.secure_url ||
    data.secure_url
      .replace("/upload/", "/upload/vc_h264,ac_aac,f_mp4/")
      .replace(/\.(mov|MOV|hevc|HEVC|avi|AVI|3gp|3GP)$/, ".mp4");

  return {
    secure_url: finalUrl,
    duration: Math.round(data.duration || 60),
  };
};

// =============================================
// PATHS — ADMIN
// =============================================
export const fetchPaths = async () => {
  const { data } = await api.get("admin-panel/api/paths/");
  return data;
};

export const approvePath = async (id) => {
  const { data } = await api.post(
    `admin-panel/api/paths/${id}/approve/`
  );
  return data;
};

export const hidePath = async (id) => {
  const { data } = await api.post(
    `admin-panel/api/paths/${id}/hide/`
  );
  return data;
};

export const deletePath = async (id) => {
  await api.delete(`admin-panel/api/paths/${id}/delete/`);
};

export const createPath = async (payload) => {
  const { data } = await api.post(
    "admin-panel/api/paths/create/",
    payload
  );
  return data;
};

// =============================================
// PATHS — ÉTABLISSEMENT
// =============================================
export const fetchEtablissementPaths = async () => {
  const { data } = await api.get(
    "admin-panel/api/etablissement/paths/"
  );
  return data;
};

export const approveEtablissementPath = async (id) => {
  const { data } = await api.post(
    `admin-panel/api/etablissement/paths/${id}/approve/`
  );
  return data;
};

// ✅ AJOUT IMPORTANT (corrige ton erreur)
export const rejectEtablissementPath = async (id) => {
  const { data } = await api.post(
    `admin-panel/api/etablissement/paths/${id}/reject/`
  );
  return data;
};

export const hideEtablissementPath = async (id) => {
  const { data } = await api.post(
    `admin-panel/api/etablissement/paths/${id}/hide/`
  );
  return data;
};

export const deleteEtablissementPath = async (id) => {
  await api.delete(
    `admin-panel/api/etablissement/paths/${id}/delete/`
  );
};

// =============================================
// ÉTABLISSEMENTS
// =============================================
export const fetchEtablissements = async () => {
  const { data } = await api.get(
    "admin-panel/api/etablissements/"
  );
  return data;
};

export const deleteEtablissement = async (id) => {
  await api.delete(
    `admin-panel/api/etablissements/${id}/delete/`
  );
};

export const toggleEtablissement = async (id) => {
  const { data } = await api.post(
    `admin-panel/api/users/${id}/toggle-etablissement/`
  );
  return data;
};

// =============================================
// UTILISATEURS
// =============================================
export const fetchConnectedUsers = async () => {
  const { data } = await api.get(
    "admin-panel/api/users/"
  );
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(
    `admin-panel/api/users/${id}/delete/`
  );
};

export const toggleAdminRole = async (id) => {
  const { data } = await api.post(
    `admin-panel/api/users/${id}/toggle-admin/`
  );
  return data;
};