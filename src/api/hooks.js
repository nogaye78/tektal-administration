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
      const paths = await fetchPaths();
      setData(paths);
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
    await approvePath(id);
    refetch();
  };

  const reject = async (id) => {
    await rejectPath(id);
    refetch();
  };

  return { approve, reject };
};

// Hook création parcours
export const useCreatePath = (refetch) => {
  const [loading, setLoading] = useState(false);

  const create = async (formData) => {
    setLoading(true);
    await createPath(formData);
    setLoading(false);
    refetch();
  };

  return { create, loading };
};

// Hook utilisateurs connectés
export const useConnectedUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const users = await fetchConnectedUsers();
    setData(users);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, refetch: load };
};
