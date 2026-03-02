import { useState } from "react";
import { Search, Users, ShieldCheck, Trash2, X } from "lucide-react";
import { useConnectedUsers } from "../api/hooks";
import { deleteUser, updateUserRole } from "../api/apiService";

const Utilisateurs = () => {
  const { data: users, loading, error, refetch } = useConnectedUsers();
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);

  // 🔴 Remplace par ton auth context si besoin
  const currentUserId = 1;

  // 🔴 Supprimer utilisateur
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
      refetch();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  // 🔄 Mettre à jour rôle
  const handleUpdateRole = async (user, role) => {
    if (!user) return;
    if (user.id === currentUserId) {
      alert("Tu ne peux pas modifier ton propre rôle.");
      return;
    }
    try {
      await updateUserRole(user.id, role);
      setRoleModalUser(null);
      refetch();
    } catch (err) {
      console.error("Erreur rôle :", err);
    }
  };

  const filtered = users?.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>

      {/* Modal suppression */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Confirmer la suppression</h2>
              <button onClick={() => setUserToDelete(null)}>
                <X size={20} />
              </button>
            </div>
            <p>
              Supprimer <b>{userToDelete?.username ?? ""}</b> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal rôle */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">
                Modifier le rôle de {roleModalUser?.username ?? ""}
              </h2>
              <button onClick={() => setRoleModalUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleUpdateRole(roleModalUser, "admin")}
                className="w-full py-2 rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
              >
                👑 Rendre Admin
              </button>
              <button
                onClick={() => handleUpdateRole(roleModalUser, "establishment")}
                className="w-full py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              >
                🏢 Rendre Établissement
              </button>
              <button
                onClick={() => handleUpdateRole(roleModalUser, "user")}
                className="w-full py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                👤 Rendre Simple Utilisateur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border"
        />
      </div>

      {/* Liste utilisateurs */}
      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : filtered?.length === 0 ? (
        <div className="text-center text-gray-400">
          <Users size={48} className="mx-auto opacity-20" />
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-xl border flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-sm">{user.username}</h3>
                <p className="text-xs text-gray-400">{user.email}</p>
                {user.role === "admin" && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Admin</span>
                )}
                {user.role === "establishment" && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Établissement</span>
                )}
              </div>

              <div className="flex gap-2">
                {/* Ouvrir modal rôle */}
                <button
                  onClick={() => setRoleModalUser(user)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-100 transition"
                >
                  <ShieldCheck size={18} />
                </button>

                {/* Supprimer */}
                <button
                  onClick={() => setUserToDelete(user)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Utilisateurs;