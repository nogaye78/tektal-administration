import { useState } from "react";
import { Search, Users, ShieldCheck, Trash2, X } from "lucide-react";
import { fetchConnectedUsers, deleteUser, toggleUserRole } from "../api/apiService";

const Utilisateurs = () => {
  const { data: users, loading, error, refetch } = fetchConnectedUsers(); // utilise ton hook personnalisé ou remplace par useEffect + state si besoin
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToRole, setUserToRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState("participant");

  // 🔹 Supprimer un utilisateur
  const handleDelete = async () => {
    await deleteUser(userToDelete.id);
    setUserToDelete(null);
    refetch();
  };

  // 🔹 Changer le rôle d’un utilisateur
  const handleChangeRole = async () => {
    await toggleUserRole(userToRole.id, selectedRole);
    setUserToRole(null);
    refetch();
  };

  // 🔹 Filtrer les utilisateurs selon recherche
  const filtered = users?.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>

      {/* MODAL SUPPRESSION */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Confirmer la suppression</h2>
              <button onClick={() => setUserToDelete(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Voulez-vous vraiment supprimer <span className="font-bold text-slate-800">{userToDelete.username}</span> ? Cette action est irréversible.
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

      {/* MODAL ROLE */}
      {userToRole && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Changer le rôle de {userToRole.username}</h2>
              <button onClick={() => setUserToRole(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="participant"
                       checked={selectedRole === "participant"}
                       onChange={() => setSelectedRole("participant")} />
                Participant
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="admin"
                       checked={selectedRole === "admin"}
                       onChange={() => setSelectedRole("admin")} />
                Admin
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="etablissement"
                       checked={selectedRole === "etablissement"}
                       onChange={() => setSelectedRole("etablissement")} />
                Établissement
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setUserToRole(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleChangeRole}
                className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition text-sm"
              >
                Confirmer
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
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm"
        />
      </div>

      {/* Liste utilisateurs */}
      {loading ? (
        <p className="text-gray-500 text-center">Chargement des utilisateurs...</p>
      ) : error ? (
        <p className="text-red-500 text-center text-sm">Erreur: {JSON.stringify(error)}</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Users className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FEBD00]/20 text-[#FEBD00] flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-sm">{user.username}</h3>
                    {user.role === "admin" && (
                      <span className="text-xs bg-[#FEBD00]/20 text-[#FEBD00] px-2 py-0.5 rounded-full font-medium">Admin</span>
                    )}
                    {user.role === "etablissement" && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Établissement</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {/* Bouton ouvrir modal rôle */}
                <button
                  title="Modifier rôle"
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  onClick={() => {
                    setUserToRole(user);
                    setSelectedRole(user.role);
                  }}
                >
                  <ShieldCheck size={20} />
                </button>

                {/* Supprimer */}
                <button
                  title="Supprimer"
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => setUserToDelete(user)}
                >
                  <Trash2 size={20} />
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