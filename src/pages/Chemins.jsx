import { useState } from "react";
import { Search, Map, Trash2, CheckCircle, PlusCircle, Video, Loader2 } from "lucide-react";
import { usePathsList, usePathActions, useCreatePath } from "../api/hooks";

const TYPE_CHOICES = [
  { value: "DESTINATION", label: "Destination" },
  { value: "ACTIVITY", label: "Activite" },
];

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

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "tektal_videos");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload",
    {
      method: "POST",
      body: fd,
    }
  );

  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || "Upload echoue");
  return data.secure_url;
};

const Chemins = () => {
  const { data, loading, error, refetch } = usePathsList();
  const chemins = data || [];
  const { approve, reject } = usePathActions(refetch);
  const { create, loading: creating } = useCreatePath(refetch);

  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [videoName, setVideoName] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type_parcours: "DESTINATION",
    video_url: "",
  });

  const filteredChemins = chemins.filter((c) =>
    (c.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoName(file.name);
    setUploadError("");
    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, video_url: url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.video_url) {
      setUploadError("Veuillez uploader une video.");
      return;
    }

    await create({
      title: formData.title,
      type_parcours: formData.type_parcours,
      video_url: formData.video_url,
    });

    setFormData({
      title: "",
      type_parcours: "DESTINATION",
      video_url: "",
    });

    setVideoName("");
    setUploadError("");
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Gestion des Chemins
      </h1>

      {/* FORMULAIRE DIRECTEMENT DANS LA PAGE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h2 className="text-xl font-bold">Nouveau Parcours</h2>

        <form onSubmit={handleCreate} className="space-y-4">

          <input
            type="text"
            placeholder="Titre du parcours"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
            required
          />

          <select
            value={formData.type_parcours}
            onChange={(e) =>
              setFormData({ ...formData, type_parcours: e.target.value })
            }
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
          >
            {TYPE_CHOICES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 flex flex-col items-center cursor-pointer hover:border-[#FEBD00] transition">
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-[#FEBD00]" />
            ) : (
              <Video size={24} className="text-gray-400 mb-2" />
            )}

            <span className="text-sm text-gray-500 mt-1">
              {uploading
                ? "Upload en cours..."
                : videoName
                ? videoName
                : "Choisir une video"}
            </span>

            {formData.video_url && (
              <span className="text-xs text-green-500 mt-1">
                Video uploadee
              </span>
            )}

            {uploadError && (
              <span className="text-xs text-red-500 mt-1">
                {uploadError}
              </span>
            )}

            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoChange}
            />
          </label>

          <button
            type="submit"
            disabled={creating || uploading}
            className="w-full bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition flex justify-center items-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creation...
              </>
            ) : (
              "Creer le parcours"
            )}
          </button>
        </form>
      </div>

      {/* RECHERCHE */}
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

      <div className="space-y-3">
        {filteredChemins.map((chemin) => (
          <div
            key={chemin.id}
            className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-slate-800">
                {chemin.title}
              </h3>
              <p className="text-xs text-gray-400">
                Type : {chemin.type_parcours}
              </p>
              <p className="text-xs text-gray-400">
                Auteur : {chemin.author}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => approve(chemin.id)}
                className="text-green-500"
              >
                <CheckCircle size={22} />
              </button>

              <button
                onClick={() => reject(chemin.id)}
                className="text-red-500"
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