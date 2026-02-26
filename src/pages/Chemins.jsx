import { useState } from "react";
import { Search, Map, Trash2, CheckCircle, Video, Filter } from "lucide-react";
import { usePathsList, usePathActions } from "../api/hooks";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-600",
  APPROVED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  PENDING: "En attente",
  APPROVED: "Valide",
  REJECTED: "Refusé",
};

const TYPE_CHOICES = ["DESTINATION", "ACTIVITY"];

const Chemins = () => {
  const { data, loading, error, refetch } = usePathsList();
  const chemins = data || [];
  const { approve, reject } = usePathActions(refetch);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Filtrage par titre et type
  const filteredChemins = chemins.filter((c) => {
    const matchTitle = (c.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchType = typeFilter ? c.type_parcours === typeFilter : true;
    return matchTitle && matchType;
  });

  // Fonction pour confirmer avant rejet
  const handleReject = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir refuser ce chemin ?")) {
      reject(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Gestion des Chemins
        </h1>

        {/* Filtre type */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FEBD00]"
          >
            <option value="">Tous les types</option>
            {TYPE_CHOICES.map((type) => (
              <option key={type} value={type}>
                {type === "DESTINATION" ? "Destination" : "Activité"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Rechercher un chemin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm"
        />
      </div>

      {/* Loader / Erreur / Aucun chemin */}
      {loading && (
        <p className="text-gray-500 text-center">Chargement...</p>
      )}
      {error && (
        <p className="text-red-500 text-center text-sm">Erreur lors du chargement</p>
      )}
      {!loading && filteredChemins.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Map className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun chemin trouvé.</p>
        </div>
      )}

      {/* Liste des chemins */}
      <div className="space-y-3">
        {filteredChemins.map((chemin) => (
          <div
            key={chemin.id}
            className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-sm"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {chemin.title}
              </h3>
              <p className="text-xs text-gray-400">
                Type :{" "}
                {chemin.type_parcours === "DESTINATION"
                  ? "Destination"
                  : "Activité"}
              </p>
              <p className="text-xs text-gray-400">Auteur : {chemin.author}</p>

              {chemin.video_url && (
                <a
                  href={chemin.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 flex items-center gap-1"
                >
                  <Video size={12} /> Voir la vidéo
                </a>
              )}

              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  STATUS_COLORS[chemin.status]
                }`}
              >
                {STATUS_LABELS[chemin.status]}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 self-end sm:self-auto">
              <button
                onClick={() => approve(chemin.id)}
                className="text-green-500 hover:scale-110 transition"
              >
                <CheckCircle size={22} />
              </button>

              <button
                onClick={() => handleReject(chemin.id)}
                className="text-red-500 hover:scale-110 transition"
              >
                <Trash2 size={22} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chemins;