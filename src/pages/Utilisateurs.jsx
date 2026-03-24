import { useState } from "react";
import { Search, Users, ShieldCheck, Trash2, X, Building2, Loader2, UserCheck, Crown, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1); // ✅ Page courante

  const [confirmAction, setConfirmAction] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  // ✅ Filtrage
  const filtered = users?.filter((u) => {
    const matchSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // ✅ Pagination calculée sur les résultats filtrés
  const totalPages = Math.ceil((filtered?.length || 0) / ITEMS_PER_PAGE);
  const paginated = filtered?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ✅ Reset page quand search ou filtre change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (role) => {
    setFilterRole(role);
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

  // ✅ Génère les numéros de pages à afficher (avec ellipsis)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
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
            onChange={handleSearchChange} // ✅ reset page
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)} // ✅ reset page
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
                  <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${isSuperAdmin ? "bg-[#FEBD00]/5" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 relative ${
                          isSuperAdmin ? "bg-[#FEBD00] text-black" : isAdmin ? "bg-[#FEBD00]/60 text-black" : "bg-slate-100 text-slate-600"
                        }`}>
                          {user.username?.charAt(0).toUpperCase()}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${roleConfig.dot}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{user.username}</span>
                            {isSuperAdmin && (
                              <span className="flex items-center gap-0.5 bg-[#FEBD00] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                                <Crown size={10} /> Super Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleConfig.bg} ${roleConfig.text}`}>
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isSuperAdmin ? (
                          <span className="text-xs text-gray-300 italic">Protégé</span>
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

          {/* ✅ Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs text-gray-400">
                Affichage{" "}
                <span className="font-semibold text-gray-600">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                sur <span className="font-semibold text-gray-600">{filtered.length}</span> utilisateurs
              </p>

              <div className="flex items-center gap-1">
                {/* Bouton Précédent */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-white hover:border-[#FEBD00] hover:text-[#FEBD00] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Numéros de pages */}
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        currentPage === page
                          ? "bg-[#FEBD00] text-black shadow-sm"
                          : "border border-gray-200 text-gray-500 hover:bg-white hover:border-[#FEBD00] hover:text-[#FEBD00]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Bouton Suivant */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-white hover:border-[#FEBD00] hover:text-[#FEBD00] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals inchangés... */}
      {/* (garder les 2 modals confirmAction et userToDelete identiques à l'original) */}
    </div>
  );
};

export default Utilisateurs;