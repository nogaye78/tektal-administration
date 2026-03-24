import { useState } from "react";
import { Search, Users, ShieldCheck, Trash2, X, Building2, Loader2, UserCheck, Crown, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useConnectedUsers } from "../api/hooks";
import { deleteUser, toggleAdmin, toggleEtablissement } from "../api/apiService";

const ROLE_CONFIG = {
  admin: { label: "Admin", bg: "bg-[#FEBD00]/20", text: "text-yellow-700", dot: "bg-[#FEBD00]" },
  etablissement: { label: "Etablissement", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  participant: { label: "Participant", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-300" },
};

const ITEMS_PER_PAGE = 10;

const Utilisateurs = () => {
  const { data: users, loading, error, refetch } = useConnectedUsers();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [confirmAction, setConfirmAction] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteUser(userToDelete.id);
    setUserToDelete(null);
    setDeleting(false);
    refetch();
    showToast("Utilisateur supprimé avec succès");
  };

  const handleConfirmToggle = async () => {
    if (!confirmAction) return;
    setToggling(true);
    if (confirmAction.type === "admin") {
      await toggleAdmin(confirmAction.user.id);
    } else {
      await toggleEtablissement(confirmAction.user.id);
    }
    setToggling(false);
    setConfirmAction(null);
    refetch();
    showToast("Statut modifié avec succès");
  };

  const handleSuperAdminAction = () => {
    showToast("Action impossible : le Super Admin est protégé", "error");
  };

  const filtered = users?.filter((u) => {
    const matchSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalItems = filtered?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered?.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleChange = (key) => {
    setFilterRole(key);
    setCurrentPage(1);
  };

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

  const getConfirmMessage = () => {
    if (!confirmAction) return "";
    const { user, type } = confirmAction;
    if (type === "admin") {
      return user.role === "admin"
        ? `Voulez-vous retirer le rôle Admin à ${user.username} ?`
        : `Voulez-vous rendre ${user.username} Admin ?`;
    }
    return user.role === "etablissement"
      ? `Voulez-vous retirer le rôle Etablissement à ${user.username} ?`
      : `Voulez-vous rendre ${user.username} Etablissement ?`;
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? "✅" : "🚫"} {toast.message}
        </div>
      )}

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
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleRoleChange(tab.key)}
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
          <p className="font-semibold">Aucun utilisateur trouve</p>
          <p className="text-xs mt-1">Modifiez vos filtres ou la recherche</p>
        </div>
      )}

      {/* Tableau */}
      {!loading && paginated?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Utilisateur</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.participant;
                const isAdmin = user.role === "admin";
                const isSuperAdmin = user.is_superuser;

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      isSuperAdmin ? "bg-gradient-to-r from-violet-50/60 to-[#FEBD00]/5 border-l-2 border-l-violet-400" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`relative flex-shrink-0 ${isSuperAdmin ? "p-[2px] rounded-xl bg-gradient-to-br from-violet-500 to-purple-700" : ""}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm relative ${
                            isSuperAdmin
                              ? "bg-gradient-to-br from-violet-600 to-purple-800 text-white"
                              : isAdmin
                              ? "bg-[#FEBD00]/60 text-black"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {user.username?.charAt(0).toUpperCase()}
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${roleConfig.dot}`} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-800">{user.username}</span>
                            {isSuperAdmin && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm shadow-violet-300">
                                <Zap size={9} className="fill-white" />
                                Super Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">{user.email}</td>

                    <td className="px-5 py-3.5">
                      {isSuperAdmin ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200">
                          Super Admin
                        </span>
                      ) : (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleConfig.bg} ${roleConfig.text}`}>
                          {roleConfig.label}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isSuperAdmin ? (
                          <>
                            <button onClick={handleSuperAdminAction} className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 text-gray-200 cursor-not-allowed">
                              <ShieldCheck size={15} />
                            </button>
                            <button onClick={handleSuperAdminAction} className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 text-gray-200 cursor-not-allowed">
                              <Building2 size={15} />
                            </button>
                            <button onClick={handleSuperAdminAction} className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 text-gray-200 cursor-not-allowed">
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              title={user.role === "admin" ? "Retirer admin" : "Rendre admin"}
                              onClick={() => setConfirmAction({ user, type: "admin" })}
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
                              onClick={() => setConfirmAction({ user, type: "etablissement" })}
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs text-gray-400">
                {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, totalItems)} sur{" "}
                <span className="font-semibold text-gray-600">{totalItems}</span> utilisateurs
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                {getPageNumbers().map((page, i) =>
                  page === "..." ? (
                    <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        safePage === page
                          ? "bg-[#FEBD00] text-black shadow-sm"
                          : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal confirmation statut */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Confirmer le changement</h2>
              <button onClick={() => setConfirmAction(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl p-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FEBD00] text-black flex items-center justify-center font-bold text-base flex-shrink-0">
                {confirmAction.user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{confirmAction.user.username}</p>
                <p className="text-xs text-gray-400">{confirmAction.user.email}</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{getConfirmMessage()}</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer font-semibold">
                Annuler
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={toggling}
                className="flex-1 py-2.5 rounded-xl bg-[#FEBD00] text-black font-semibold hover:bg-yellow-400 transition text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {toggling ? <><Loader2 size={16} className="animate-spin" /> En cours...</> : "Confirmer"}
              </button>
            </div>
          </div>
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
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer font-semibold">
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