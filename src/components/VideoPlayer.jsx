// ✅ Applique la transformation H264 uniquement à la lecture
// ✅ Évite de doubler la transformation si déjà présente dans l'URL
const getH264Url = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("vc_h264")) return url; // déjà transformée
  return url.replace("/upload/", "/upload/vc_h264,ac_aac,f_mp4/");
};

// ✅ Miniature automatique depuis la 1ère frame de la vidéo
export const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes("cloudinary.com")) return null;
  return videoUrl
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,w_400/")
    .replace(/\.(mp4|mov|avi|webm|MOV|HEVC|hevc|3gp)$/, ".jpg");
};

export default function VideoPlayer({ url, className = "", maxHeight = "max-h-48" }) {
  if (!url) return null;

  const originalUrl = url;
  const h264Url     = getH264Url(url);

  return (
    <video
      key={originalUrl}
      controls
      preload="metadata"
      playsInline
      className={`w-full rounded-xl bg-gray-900 ${maxHeight} ${className}`}
    >
      {/* ✅ Source 1 : URL originale */}
      <source src={originalUrl} type="video/mp4" />
      {/* ✅ Source 2 : avec transformation H264 si la première échoue */}
      <source src={h264Url} type="video/mp4" />
      {/* ✅ Source 3 : fallback quicktime pour les MOV iPhone */}
      <source src={originalUrl} type="video/quicktime" />
    </video>
  );
}