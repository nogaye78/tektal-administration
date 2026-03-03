import { useState, useEffect } from "react";
import { Building2, Search, Trash2, X, MapPin, Mail, Route, Loader2 } from "lucide-react";
import { fetchEtablissements, deleteEtablissement } from "../api/apiService";

const Etablissements = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [etabToDelete, setEtabToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchEtablissements();
      const list = response?.results || response || [];
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEtablissement(etabToDelete.id);
      setEtabToDelete(null);
      load();
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  const filtered = data.filter((e) =>
    (e.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.user_email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Building2 size={14} className="text-[#FEBD00]" />
              </div>
              <span className="text-[#FEBD00] text-sm font-medium">Gestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Etablissements</h1>
            <p className="text-slate-400 text-sm mt-1">
              {data.length} etablissement{data.length > 1 ? "s" : ""} enregistres
            </p>
          </div>
          <div className="bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl px-5 py-3 text-center">
            <p className="text-3xl font-bold text-[#FEBD00]">{data.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher un etablissement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm bg-white"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#FEBD00]" size={32} />
        </div>
      )}
      {error && <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-xl">Erreur de chargement</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
          <Building2 className="mx-auto mb-3 opacity-10" size={48} />
          <p className="font-medium">Aucun etablissement trouve</p>
          <p className="text-xs mt-1">Modifiez votre recherche</p>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-2">
        {filtered.map((etab) => (
          <div
            key={etab.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 group"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-[#FEBD00] text-black flex items-center justify-center font-bold text-base flex-shrink-0">
                {etab.name?.charAt(0).toUpperCase()}
              </div>

              {/* Infos */}
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{etab.name}</h3>

                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Mail size={11} className="flex-shrink-0" />
                  {etab.user_email || "-"}
                </p>

                {etab.lat && etab.lng && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <MapPin size={11} className="flex-shrink-0" />
                    {etab.lat}, {etab.lng}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FEBD00]/10 text-yellow-700 font-medium flex items-center gap-1">
                    <Route size={10} />
                    {etab.total_paths || 0} chemin{etab.total_paths > 1 ? "s" : ""}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                    Cree le {new Date(etab.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="self-end sm:self-auto flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEtabToDelete(etab)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                title="Supprimer"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal suppression */}
      {etabToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Supprimer l'etablissement</h2>
              <button onClick={() => setEtabToDelete(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FEBD00] text-black flex items-center justify-center font-bold text-base flex-shrink-0">
                {etabToDelete.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{etabToDelete.name}</p>
                <p className="text-xs text-gray-400">{etabToDelete.user_email}</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed">
              Cette action est <span className="text-red-500 font-semibold">irreversible</span>. L'etablissement et son compte utilisateur seront definitivement supprimes.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEtabToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
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

export default Etablissements;