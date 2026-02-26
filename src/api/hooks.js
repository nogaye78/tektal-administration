import { useState, useEffect } from "react";
import { fetchPaths, approvePath, rejectPath, createPath, fetchConnectedUsers } from "./apiService";

// Hook pour récupérer les parcours
export const usePathsList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchPaths();
      // ✅ Gère la pagination Django et les tableaux simples
      const paths = response?.results || response || [];
      setData(Array.isArray(paths) ? paths : []);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, refetch: load };
};

// Hook pour actions sur les parcours
export const usePathActions = (refetch) => {
  const approve = async (id) => {
    try {
      await approvePath(id);
      refetch();
    } catch (err) {
      console.error("Erreur approbation:", err);
    }
  };

  const reject = async (id) => {
    try {
      await rejectPath(id);
      refetch();
    } catch (err) {
      console.error("Erreur refus:", err);
    }
  };

  return { approve, reject };
};

// Hook création parcours
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
      console.error("Erreur création:", err);
      setError(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

// Hook utilisateurs connectés
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

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, refetch: load };
};