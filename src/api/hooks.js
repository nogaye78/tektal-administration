import { useState, useEffect } from "react";
import {
  fetchPaths, approvePath, rejectPath, createPath,
  fetchConnectedUsers, deletePath, hidePath, // ✅ hidePath ajouté
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
    try { await approvePath(id); refetch(); }
    catch (err) { console.error("Erreur approbation:", err); }
  };

  const reject = async (id) => {
    try { await rejectPath(id); refetch(); }
    catch (err) { console.error("Erreur refus:", err); }
  };

  const remove = async (id) => {
    try {
      const res = await deletePath(id);
      // ✅ deletePath utilise fetch() natif — on vérifie le statut HTTP
      if (res.ok || res.status === 204 || res.status === 200) {
        refetch();
      } else {
        console.error("Suppression échouée, statut:", res.status);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const hide = async (id) => {
    try {
      // ✅ hidePath était manquant dans l'import, maintenant corrigé
      await hidePath(id);
      refetch();
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
      refetch();
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
    try { await approveEtablissementPath(id); refetch(); }
    catch (err) { console.error("Erreur approbation:", err); }
  };

  const reject = async (id) => {
    try { await rejectEtablissementPath(id); refetch(); }
    catch (err) { console.error("Erreur refus:", err); }
  };

  return { approve, reject };
};