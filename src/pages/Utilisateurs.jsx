import { useState } from "react";
import { Search, Users, ShieldCheck, Trash2, X, Building2 } from "lucide-react";
import { useConnectedUsers } from "../api/hooks";
import { deleteUser, updateUserRole } from "../api/apiService";

const Utilisateurs = () => {
  const { data: users, loading, error, refetch } = useConnectedUsers();
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  // ⚠️ Récupère l'id du user connecté depuis ton auth context
  const currentUserId = 1;

  // 🔴 Suppression
  const handleDelete = async () => {
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
      refetch();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  // 🔄 Changement de rôle
  const handleUpdateRole = async (user, role) => {
    if (user.id === currentUserId) {
      alert("Tu ne peux pas modifier ton propre rôle.");
      return;
    }

    const confirmAction = window.confirm(
      `Changer le rôle de ${user.username} en ${role} ?`
    );

    if (!confirmAction) return;

    try {
      await updateUserRole(user.id, role);
      refetch();
    } catch (err) {
      console.error("Erreur modification rôle :", err);
    }
  };

  const filtered = users?.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Gestion des Utilisateurs
      </h1>

      {/* 🗑️ MODAL SUPPRESSION */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                Confirmer la suppression
              </h2>
              <button
                onClick={() => setUserToDelete(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Supprimer{" "}
              <span className="font-bold text-slate-800">
                {userToDelete.username}
              </span>{" "}
              ?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm"
              >
                Annuler
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 Recherche */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm"
        />
      </div>

      {/* 📊 Liste */}
      {loading ? (
        <p className="text-center text-gray-500">
          Chargement des utilisateurs...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 text-sm">
          Erreur: {JSON.stringify(error)}
        </p>
      ) : filtered?.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Users className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEBD00]/20 text-[#FEBD00] flex items-center justify-center font-bold text-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {user.username}
                    </h3>

                    {user.role === "admin" && (
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}

                    {user.role === "establishment" && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        Établissement
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {/* 👑 Admin */}
                <button
                  title="Rendre admin"
                  onClick={() => handleUpdateRole(user, "admin")}
                  className={`p-2 rounded-lg transition ${
                    user.role === "admin"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600"
                  }`}
                >
                  <ShieldCheck size={18} />
                </button>

                {/* 🏢 Établissement */}
                <button
                  title="Rendre établissement"
                  onClick={() => handleUpdateRole(user, "establishment")}
                  className={`p-2 rounded-lg transition ${
                    user.role === "establishment"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                  }`}
                >
                  <Building2 size={18} />
                </button>

                {/* 👤 User simple */}
                <button
                  title="Rendre simple utilisateur"
                  onClick={() => handleUpdateRole(user, "user")}
                  className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition text-xs"
                >
                  User
                </button>

                {/* 🗑️ Supprimer */}
                <button
                  title="Supprimer"
                  onClick={() => setUserToDelete(user)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
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