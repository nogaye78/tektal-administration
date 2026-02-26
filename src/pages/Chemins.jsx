import { useState } from "react";
import { Search, Map, Trash2, CheckCircle, Video } from "lucide-react";
import { usePathsList, usePathActions } from "../api/hooks";
import toast, { Toaster } from "react-hot-toast"; // ✅ Import toast

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-600",
  APPROVED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  PENDING: "En attente",
  APPROVED: "Valide",
  REJECTED: "Refuse",
};

const Chemins = () => {
  const { data, loading, error, refetch } = usePathsList();
  const chemins = data || [];
  const { approve, reject, deletePath } = usePathActions(refetch); // ✅ On récupère deletePath

  const [searchTerm, setSearchTerm] = useState("");

  const filteredChemins = chemins.filter((c) =>
    (c.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer ce chemin ?");
    if (!confirm) return;

    try {
      await deletePath(id); // Appel à l'API pour supprimer
      toast.success("Chemin supprimé avec succès !");
      refetch(); // Actualiser la liste
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression !");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" /> {/* ✅ Composant pour afficher les toasts */}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Gestion des Chemins
        </h1>
      </div>

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

      {loading && <p className="text-gray-500 text-center">Chargement...</p>}
      {error && <p className="text-red-500 text-center text-sm">Erreur</p>}

      {!loading && filteredChemins.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Map className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun chemin trouvé.</p>
        </div>
      )}

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
                Type : {chemin.type_parcours}
              </p>
              <p className="text-xs text-gray-400">
                Auteur : {chemin.author}
              </p>

              {chemin.video_url && (
                <div className="mt-2">
                  <video
                    src={chemin.video_url}
                    controls
                    className="w-full max-w-xs rounded-lg"
                  >
                    Votre navigateur ne supporte pas la lecture de la vidéo.
                  </video>
                </div>
              )}

              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  STATUS_COLORS[chemin.status]
                }`}
              >
                {STATUS_LABELS[chemin.status]}
              </span>
            </div>

            <div className="flex gap-3 self-end sm:self-auto">
              <button
                onClick={() => approve(chemin.id)}
                className="text-green-500 hover:scale-110 transition"
              >
                <CheckCircle size={22} />
              </button>

              <button
                onClick={() => handleDelete(chemin.id)}
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