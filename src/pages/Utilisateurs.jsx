import { useState } from "react";
import { Search, Users, ShieldCheck, Trash2, X, Building2, Loader2, UserCheck } from "lucide-react";
import { useConnectedUsers } from "../api/hooks";
import { deleteUser, toggleAdmin, toggleEtablissement } from "../api/apiService";

const ROLE_CONFIG = {
  admin: { label: "Admin", bg: "bg-[#FEBD00]/20", text: "text-yellow-700", dot: "bg-[#FEBD00]" },
  etablissement: { label: "Etablissement", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  participant: { label: "Participant", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-300" },
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

  const handleToggleAdmin = async (id) => { await toggleAdmin(id); refetch(); };
  const handleToggleEtablissement = async (id) => { await toggleEtablissement(id); refetch(); };

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

  const tabs = [
    { key: "all", label: "Tous", icon: <Users size={13} /> },
    { key: "admin", label: "Admins", icon: <ShieldCheck size={13} /> },
    { key: "etablissement", label: "Etablissements", icon: <Building2 size={13} /> },
    { key: "participant", label: "Participants", icon: <UserCheck size={13} /> },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FEBD00]/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FEBD00]/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#FEBD00]/20 flex items-center justify-center">
                <Users size={14} className="text-[#FEBD00]" />
              </div>
              <span className="text-[#FEBD00] text-sm font-medium">Gestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Utilisateurs</h1>
            <p className="text-slate-400 text-sm mt-1">
              {users?.length || 0} membre{users?.length > 1 ? "s" : ""} enregistres
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-[#FEBD00]">{counts.admin}</p>
              <p className="text-xs text-slate-400 mt-0.5">Admins</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-white">{counts.etablissement}</p>
              <p className="text-xs text-slate-400 mt-0.5">Etablissements</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-white">{counts.participant}</p>
              <p className="text-xs text-slate-400 mt-0.5">Participants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Tabs */}
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

        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterRole(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterRole === tab.key
                  ? "bg-[#FEBD00] text-black shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                filterRole === tab.key ? "bg-black/10 text-black" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#FEBD00]" size={32} />
        </div>
      )}
      {error && (
        <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-xl">Erreur de chargement</p>
      )}

      {/* Empty */}
      {!loading && filtered?.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
          <Users className="mx-auto mb-3 opacity-10" size={48} />
          <p className="font-semibold">Aucun utilisateur trouve</p>
          <p className="text-xs mt-1">Modifiez vos filtres ou la recherche</p>
        </div>
      )}

      {/* Liste */}
      {!loading && filtered?.length > 0 && (
        <div className="space-y-2">
          {filtered.map((user) => {
            const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.participant;
            const isAdmin = user.role === "admin";
            return (
              <div
                key={user.id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between gap-3 group ${
                  isAdmin ? "border-[#FEBD00]/30" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 relative ${
                    isAdmin ? "bg-[#FEBD00] text-black" : "bg-slate-100 text-slate-600"
                  }`}>
                    {user.username?.charAt(0).toUpperCase()}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${roleConfig.dot}`} />
                  </div>

                  {/* Infos */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-sm">{user.username}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${roleConfig.bg} ${roleConfig.text}`}>
                        {roleConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button
                    title={user.role === "admin" ? "Retirer admin" : "Rendre admin"}
                    onClick={() => handleToggleAdmin(user.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                      user.role === "admin"
                        ? "bg-[#FEBD00] text-black hover:bg-yellow-400"
                        : "bg-gray-50 text-gray-400 hover:bg-[#FEBD00]/20 hover:text-yellow-700"
                    }`}
                  >
                    <ShieldCheck size={15} />
                  </button>

                  <button
                    title={user.role === "etablissement" ? "Retirer etablissement" : "Rendre etablissement"}
                    onClick={() => handleToggleEtablissement(user.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                      user.role === "etablissement"
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        : "bg-gray-50 text-gray-400 hover:bg-slate-100 hover:text-slate-600"
                    }`}
                  >
                    <Building2 size={15} />
                  </button>

                  <button
                    title="Supprimer"
                    onClick={() => setUserToDelete(user)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal suppression */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Supprimer l'utilisateur</h2>
              <button onClick={() => setUserToDelete(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FEBD00] text-black flex items-center justify-center font-bold text-base flex-shrink-0">
                {userToDelete.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{userToDelete.username}</p>
                <p className="text-xs text-gray-400">{userToDelete.email}</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed">
              Voulez-vous vraiment supprimer cet utilisateur ? Cette action est{" "}
              <span className="text-red-500 font-semibold">irreversible</span>.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer font-semibold"
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