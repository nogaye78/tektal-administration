import { useState, useEffect, useCallback } from "react";
import {
  getPaths,
  getPathById,
  updatePath,
  deletePath,
  approvePath,
  rejectPath,
  getPublicPaths,
  getConnectedUsers,
} from "./apiService";

// ─────────────────────────────────────────
// Hook générique pour les appels GET
// ─────────────────────────────────────────
const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─────────────────────────────────────────
// usePathsList → GET /api/paths/
// ─────────────────────────────────────────
export const usePathsList = () => useFetch(getPaths);

// Utilisation :
// const { data: paths, loading, error, refetch } = usePathsList();

// ─────────────────────────────────────────
// usePathDetail → GET /api/paths/:id/
// ─────────────────────────────────────────
export const usePathDetail = (id) =>
  useFetch(() => getPathById(id), [id]);

// Utilisation :
// const { data: path, loading, error } = usePathDetail(42);

// ─────────────────────────────────────────
// usePublicPaths → GET /api/paths/public/
// ─────────────────────────────────────────
export const usePublicPaths = () => useFetch(getPublicPaths);

// Utilisation :
// const { data: publicPaths, loading, error } = usePublicPaths();

// ─────────────────────────────────────────
// useConnectedUsers → GET /api/users/connected/
// ─────────────────────────────────────────
export const useConnectedUsers = () => useFetch(getConnectedUsers);

// Utilisation :
// const { data: users, loading, error } = useConnectedUsers();

// ─────────────────────────────────────────
// usePathActions → approve / reject / update / delete
// ─────────────────────────────────────────
export const usePathActions = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    approve: (id) => run(() => approvePath(id)),
    reject: (id) => run(() => rejectPath(id)),
    update: (id, payload) => run(() => updatePath(id, payload)),
    remove: (id) => run(() => deletePath(id)),
  };
};

// Utilisation :
// const { approve, reject, loading } = usePathActions(() => refetch());
// <button onClick={() => approve(path.id)}>Approuver</button>
// <button onClick={() => reject(path.id)}>Rejeter</button>