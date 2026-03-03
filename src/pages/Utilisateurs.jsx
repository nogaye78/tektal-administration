import { useState } from "react";
import { Search, Users, ShieldCheck, Trash2, X, Building2, Loader2 } from "lucide-react";
import { useConnectedUsers } from "../api/hooks";
import { deleteUser, toggleAdmin, toggleEtablissement } from "../api/apiService";

const ROLE_CONFIG = {
  admin: { label: "Admin", bg: "bg-[#FEBD00]/20", text: "text-yellow-700" },
  etablissement: { label: "Etablissement", bg: "bg-blue-100", text: "text-blue-600" },
  participant: { label: "Participant", bg: "bg-gray-100", text: "text-gray-500" },
};

const Utilisateurs = () => {
  const { data: users, loading, error, refetch } = useConnectedUsers();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteUser(userToDelete.id);
    setUserToDelete(null);
    setDeleting(false);
    refetch();
  };

  const handleToggleAdmin = async (id) => {
    await toggleAdmin(id);
    refetch();
  };

  const handleToggleEtablissement = async (id) => {
    await toggleEtablissement(id);
    refetch();
  };

  const filtered = users?.filter((u) => {
    const matchSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts = {
    all: users?.length || 0,
    admin: users?.filter((u) => u.role === "admin").length || 0,
    etablissement: users?.filter((u) => u.role === "etablissement").length || 0,
    participant: users?.filter((u) => u.role === "participant").length || 0,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-sm text-gray-400 mt-1">{users?.length || 0} membre{users?.length > 1 ? "s" : ""} enregistres</p>
        </div>
      </div>

      {/* Search + Filtres */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm bg-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Tous" },
            { key: "admin", label: "Admins" },
            { key: "etablissement", label: "Etablissements" },
            { key: "participant", label: "Participants" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterRole(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterRole === tab.key
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filterRole === tab.key ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Etats */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#FEBD00]" size={32} />
        </div>
      )}
      {error && (
        <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-xl">Erreur de chargement</p>
      )}

      {!loading && filtered?.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
          <Users className="mx-auto mb-3 opacity-10" size={48} />
          <p className="font-medium">Aucun utilisateur trouve</p>
          <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
        </div>
      )}

      {/* Liste */}
      {!loading && filtered?.length > 0 && (
        <div className="space-y-2">
          {filtered.map((user) => {
            const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.participant;
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${roleConfig.bg} ${roleConfig.text}`}>
                    {user.username?.charAt(0).toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{user.username}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${roleConfig.bg} ${roleConfig.text}`}>
                        {roleConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    title={user.role === "admin" ? "Retirer admin" : "Rendre admin"}
                    onClick={() => handleToggleAdmin(user.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      user.role === "admin"
                        ? "bg-[#FEBD00]/20 text-yellow-700 hover:bg-[#FEBD00]/30"
                        : "bg-gray-50 text-gray-400 hover:bg-[#FEBD00]/10 hover:text-yellow-600"
                    }`}
                  >
                    <ShieldCheck size={16} />
                  </button>

                  <button
                    title={user.role === "etablissement" ? "Retirer etablissement" : "Rendre etablissement"}
                    onClick={() => handleToggleEtablissement(user.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      user.role === "etablissement"
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        : "bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                    }`}
                  >
                    <Building2 size={16} />
                  </button>

                  <button
                    title="Supprimer"
                    onClick={() => setUserToDelete(user)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal suppression */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Confirmer</h2>
              <button onClick={() => setUserToDelete(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-red-50 rounded-xl p-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center font-bold flex-shrink-0">
                {userToDelete.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{userToDelete.username}</p>
                <p className="text-xs text-gray-400">{userToDelete.email}</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Cette action est <span className="text-red-500 font-semibold">irreversible</span>. L'utilisateur sera definitivement supprime.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <><Loader2 size={16} className="animate-spin" /> Suppression...</> : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilisateurs;