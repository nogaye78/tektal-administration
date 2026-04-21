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
  fetchEtablissementPaths, approveEtablissementPath, rejectEtablissementPath,
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
  return { data, loading, error, refetch: load };
};

export const usePathActions = (refetch) => {
  const approve = async (id) => {
    try {
      await approvePath(id);
      await refetch(); // ✅ await pour attendre le rechargement
    } catch (err) {
      console.error("Erreur approbation:", err);
    }
  };

  const reject = async (id) => {
    try {
      await rejectPath(id);
      await refetch();
    } catch (err) {
      console.error("Erreur refus:", err);
    }
  };

  const remove = async (id) => {
    try {
      const res = await deletePath(id);
      console.log("🗑️ DELETE status:", res.status); // ← vérifiez en console
      if (res.ok || res.status === 204 || res.status === 200) {
        await refetch(); // ✅ refetch seulement si suppression réussie
      } else {
        console.error("❌ Suppression échouée, statut:", res.status);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const hide = async (id) => {
    try {
      await hidePath(id);
      await refetch();
    } catch (err) {
      console.error("Erreur masquage:", err);
    }
  };

  return { approve, reject, remove, hide };
};

export const useCreatePath = (refetch) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await createPath(formData);
      await refetch();
    } catch (err) {
      console.error("Erreur creation:", err);
      setError(err.message || "Erreur lors de la creation");
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
  return { data, loading, error, refetch: load };
};

// ===========================
// PATHS ETABLISSEMENT
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
  return { data, loading, error, refetch: load };
};

export const useEtablissementPathActions = (refetch) => {
  const approve = async (id) => {
    try { await approveEtablissementPath(id); await refetch(); }
    catch (err) { console.error("Erreur approbation:", err); }
  };

  const reject = async (id) => {
    try { await rejectEtablissementPath(id); await refetch(); }
    catch (err) { console.error("Erreur refus:", err); }
  };

  return { approve, reject };
};