import { useState } from "react";
import { Search, Map, Trash2, CheckCircle, PlusCircle, X } from "lucide-react";
import { usePathsList, usePathActions, useCreatePath } from "../api/hooks";

const TYPE_CHOICES = [
  { value: "DESTINATION", label: "Destination" },
  { value: "ACTIVITY", label: "Activité" },
];

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-600",
  APPROVED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  PENDING: "En attente",
  APPROVED: "Validé",
  REJECTED: "Refusé",
};

const Chemins = () => {
  const { data, loading, error, refetch } = usePathsList();
  const chemins = data || [];
  const { approve, reject } = usePathActions(refetch);
  const { create, loading: creating } = useCreatePath(refetch);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type_parcours: "DESTINATION",
    video_url: "",
  });

  const filteredChemins = chemins.filter((chemin) =>
    (chemin.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    await create(formData);
    setFormData({ title: "", type_parcours: "DESTINATION", video_url: "" });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion des Chemins</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-xl transition w-full sm:w-auto"
        >
          <PlusCircle size={18} />
          Créer un parcours
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un chemin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm"
        />
      </div>

      {loading && <p className="text-gray-500 text-center">Chargement des chemins...</p>}
      {error && <p className="text-red-500 text-center text-sm">Erreur : {JSON.stringify(error)}</p>}

      {!loading && filteredChemins.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Map className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun chemin trouvé.</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredChemins.map((chemin) => (
          <div key={chemin.id} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">{chemin.title}</h3>
              <p className="text-xs text-gray-400">Type : {chemin.type_parcours}</p>
              <p className="text-xs text-gray-400">Auteur : {chemin.author}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status]}`}>
                {STATUS_LABELS[chemin.status]}
              </span>
            </div>
            <div className="flex gap-3 self-end sm:self-auto">
              <button
                onClick={() => approve(chemin.id)}
                title="Approuver"
                className="text-green-500 hover:scale-110 transition"
              >
                <CheckCircle size={22} />
              </button>
              <button
                onClick={() => reject(chemin.id)}
                title="Refuser"
                className="text-red-500 hover:scale-110 transition"
              >
                <Trash2 size={22} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg space-y-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold">Nouveau Parcours</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Titre du parcours"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                required
              />
              <select
                value={formData.type_parcours}
                onChange={(e) => setFormData({ ...formData, type_parcours: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
              >
                {TYPE_CHOICES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="url"
                placeholder="URL de la vidéo (YouTube, etc.)"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition"
              >
                {creating ? "Création..." : "Créer le parcours"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chemins;