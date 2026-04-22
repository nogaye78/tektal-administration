// import { useState, useEffect } from "react";
// import {
//   fetchPaths, approvePath, rejectPath, createPath,
//   fetchConnectedUsers, deletePath, hidePath,
//   fetchEtablissementPaths, approveEtablissementPath, rejectEtablissementPath,
//   deleteEtablissementPath, hideEtablissementPath,
// } from "./apiService";

// // ===========================
// // PATHS ADMIN
// // ===========================
// export const usePathsList = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const response = await fetchPaths();
//       const paths = response?.results || response || [];
//       setData(Array.isArray(paths) ? paths : []);
//     } catch (err) {
//       setError(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => { load(); }, []);

//   const updatePath = (id, newStatus) => {
//     setData(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
//   };

//   const removePath = (id) => {
//     setData(prev => prev.filter(p => p.id !== id));
//   };

//   const addPath = (newPath) => {
//     setData(prev => [newPath, ...prev]);
//   };

//   return { data, loading, error, refetch: load, updatePath, removePath, addPath };
// };

// export const usePathActions = (updatePath, removePath) => {
//   const approve = async (id) => {
//     try {
//       await approvePath(id);
//       updatePath(id, "published");
//     } catch (err) { console.error("Erreur approbation:", err); }
//   };

//   const reject = async (id) => {
//     try {
//       await rejectPath(id);
//       updatePath(id, "hidden");
//     } catch (err) { console.error("Erreur refus:", err); }
//   };

//   const remove = async (id) => {
//     try {
//       const res = await deletePath(id);
//       if (res.ok || res.status === 204 || res.status === 200) {
//         removePath(id);
//       } else {
//         console.error("Suppression échouée, statut:", res.status);
//       }
//     } catch (err) { console.error("Erreur suppression:", err); }
//   };

//   const hide = async (id) => {
//     try {
//       await hidePath(id);
//       updatePath(id, "hidden");
//     } catch (err) { console.error("Erreur masquage:", err); }
//   };

//   return { approve, reject, remove, hide };
// };

// export const useCreatePath = (addPath, refetch) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const create = async (formData) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const newPath = await createPath(formData);
//       if (newPath) {
//         addPath(newPath);
//       } else {
//         refetch();
//       }
//     } catch (err) {
//       console.error("Erreur creation:", err);
//       setError(err.message || "Erreur lors de la creation");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { create, loading, error };
// };

// // ===========================
// // USERS
// // ===========================
// export const useConnectedUsers = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const response = await fetchConnectedUsers();
//       const users = response?.results || response || [];
//       setData(Array.isArray(users) ? users : []);
//     } catch (err) {
//       setError(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => { load(); }, []);

//   const removeUser = (id) => {
//     setData(prev => prev.filter(u => u.id !== id));
//   };

//   const updateUser = (id, newRole) => {
//     setData(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
//   };

//   return { data, loading, error, refetch: load, removeUser, updateUser };
// };

// // ===========================
// // PATHS ETABLISSEMENT
// // ===========================
// export const useEtablissementPaths = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const response = await fetchEtablissementPaths();
//       const paths = response?.results || response || [];
//       setData(Array.isArray(paths) ? paths : []);
//     } catch (err) {
//       setError(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => { load(); }, []);

//   const updatePath = (id, newStatus) => {
//     setData(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
//   };

//   const removePath = (id) => {
//     setData(prev => prev.filter(p => p.id !== id));
//   };

//   const addPath = (newPath) => {
//     setData(prev => [newPath, ...prev]);
//   };

//   return { data, loading, error, refetch: load, updatePath, removePath, addPath };
// };

// export const useEtablissementPathActions = (updatePath, removePath) => {
//   const approve = async (id) => {
//     try {
//       await approveEtablissementPath(id);
//       updatePath(id, "published");
//     } catch (err) { console.error("Erreur approbation:", err); }
//   };

//   const reject = async (id) => {
//     try {
//       await rejectEtablissementPath(id);
//       updatePath(id, "hidden");
//     } catch (err) { console.error("Erreur refus:", err); }
//   };

//   const remove = async (id) => {
//     try {
//       const res = await deleteEtablissementPath(id);
//       if (res.ok || res.status === 204 || res.status === 200) {
//         removePath(id);
//       } else {
//         console.error("Suppression échouée, statut:", res.status);
//       }
//     } catch (err) { console.error("Erreur suppression:", err); }
//   };

//   const hide = async (id) => {
//     try {
//       await hideEtablissementPath(id);
//       updatePath(id, "hidden");
//     } catch (err) { console.error("Erreur masquage:", err); }
//   };

//   return { approve, reject, remove, hide };
// };












import { useState, useEffect } from "react";
import {
  fetchPaths, approvePath, rejectPath, createPath,
  fetchConnectedUsers, deletePath, hidePath,
  fetchEtablissementPaths, approveEtablissementPath,
  rejectEtablissementPath, deleteEtablissementPath, hideEtablissementPath,
} from "./apiService";

// ===========================
// PATHS ADMIN
// ===========================
export const usePathsList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchPaths();
      const paths = response?.results || response || [];
      setData(Array.isArray(paths) ? paths : []);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ✅ AJOUT — updatePath, removePath, addPath pour mises à jour optimistes
  const updatePath = (id, newData) => {
    setData((prev) => prev.map((p) => p.id === id ? { ...p, ...newData } : p));
  };

  const removePath = (id) => {
    setData((prev) => prev.filter((p) => p.id !== id));
  };

  const addPath = (newPath) => {
    setData((prev) => [newPath, ...prev]);
  };

  return { data, loading, error, refetch: load, updatePath, removePath, addPath };
};

export const usePathActions = (updatePath, removePath) => {
  const approve = async (id) => {
    try {
      await approvePath(id);
      // ✅ Mise à jour optimiste — pas de refetch
      updatePath(id, { status: "published" });
    } catch (err) {
      console.error("Erreur approbation:", err);
    }
  };

  const reject = async (id) => {
    try {
      await rejectPath(id);
      updatePath(id, { status: "hidden" });
    } catch (err) {
      console.error("Erreur refus:", err);
    }
  };

  const remove = async (id) => {
    try {
      const res = await deletePath(id);
      if (res.ok || res.status === 204 || res.status === 200) {
        // ✅ Retire de la liste immédiatement
        removePath(id);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const hide = async (id) => {
    try {
      const result = await hidePath(id);
      // ✅ Toggle : met à jour le statut retourné par l'API
      updatePath(id, { status: result?.status || "hidden" });
    } catch (err) {
      console.error("Erreur masquage:", err);
    }
  };

  return { approve, reject, remove, hide };
};

export const useCreatePath = (addPath, refetch) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const newPath = await createPath(formData);
      if (newPath && addPath) {
        // ✅ Ajoute en tête de liste sans refetch
        addPath(newPath);
      } else {
        await refetch();
      }
    } catch (err) {
      console.error("Erreur creation:", err);
      setError(err.message || "Erreur lors de la creation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

// ===========================
// USERS
// ===========================
export const useConnectedUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchConnectedUsers();
      const users = response?.results || response || [];
      setData(Array.isArray(users) ? users : []);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ✅ AJOUT — mises à jour optimistes utilisateurs
  const removeUser = (id) => {
    setData((prev) => prev.filter((u) => u.id !== id));
  };

  const updateUser = (id, newData) => {
    setData((prev) => prev.map((u) => u.id === id ? { ...u, ...newData } : u));
  };

  return { data, loading, error, refetch: load, removeUser, updateUser };
};

// ===========================
// PATHS ÉTABLISSEMENT
// ===========================
export const useEtablissementPaths = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchEtablissementPaths();
      const paths = response?.results || response || [];
      setData(Array.isArray(paths) ? paths : []);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ✅ AJOUT — mises à jour optimistes établissement
  const updatePath = (id, newData) => {
    setData((prev) => prev.map((p) => p.id === id ? { ...p, ...newData } : p));
  };

  const removePath = (id) => {
    setData((prev) => prev.filter((p) => p.id !== id));
  };

  const addPath = (newPath) => {
    setData((prev) => [newPath, ...prev]);
  };

  return { data, loading, error, refetch: load, updatePath, removePath, addPath };
};

export const useEtablissementPathActions = (updatePath, removePath) => {
  const approve = async (id) => {
    try {
      await approveEtablissementPath(id);
      updatePath(id, { status: "published" });
    } catch (err) {
      console.error("Erreur approbation:", err);
    }
  };

  const reject = async (id) => {
    try {
      await rejectEtablissementPath(id);
      updatePath(id, { status: "hidden" });
    } catch (err) {
      console.error("Erreur refus:", err);
    }
  };

  // ✅ AJOUT — remove et hide manquaient dans l'ancienne version
  const remove = async (id) => {
    try {
      const res = await deleteEtablissementPath(id);
      if (res.ok || res.status === 204 || res.status === 200) {
        removePath(id);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const hide = async (id) => {
    try {
      const result = await hideEtablissementPath(id);
      updatePath(id, { status: result?.status || "hidden" });
    } catch (err) {
      console.error("Erreur masquage:", err);
    }
  };

  return { approve, reject, remove, hide };
};