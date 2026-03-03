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

  useEffect(() => {
    load();
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Etablissements</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.length} etablissement{data.length > 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un etablissement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm"
        />
      </div>

      {/* States */}
      {loading && <p className="text-gray-500 text-center">Chargement...</p>}
      {error && <p className="text-red-500 text-center text-sm">Erreur de chargement</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Building2 className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun etablissement trouve.</p>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map((etab) => (
          <div
            key={etab.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FEBD00]/20 text-[#FEBD00] flex items-center justify-center font-bold text-lg flex-shrink-0">
                {etab.name?.charAt(0).toUpperCase()}
              </div>

              {/* Infos */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{etab.name}</h3>

                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Mail size={12} /> {etab.user_email || "-"}
                </p>

                {etab.lat && etab.lng && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={12} /> {etab.lat}, {etab.lng}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium flex items-center gap-1">
                    <Route size={10} />
                    {etab.total_paths || 0} chemin{etab.total_paths > 1 ? "s" : ""}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                    Actif
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Cree le : {new Date(etab.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="self-end sm:self-auto flex-shrink-0">
              <button
                onClick={() => setEtabToDelete(etab)}
                className="text-red-400 hover:text-red-600 transition cursor-pointer p-2 rounded-lg hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal confirmation suppression */}
      {etabToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Confirmer la suppression</h2>
              <button
                onClick={() => setEtabToDelete(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Voulez-vous vraiment supprimer <span className="font-bold text-slate-800">{etabToDelete.name}</span> ? Cette action est irreversible et supprimera aussi le compte utilisateur associe.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEtabToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm cursor-pointer flex justify-center items-center gap-2"
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