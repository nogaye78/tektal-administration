export const getH264Url = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("vc_h264")) return url;
  return url.replace("/upload/", "/upload/vc_h264,ac_aac,f_mp4/");
};

export const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes("cloudinary.com")) return null;

  // Retire toute transformation existante entre /upload/ et le nom du fichier
  const cleanUrl = videoUrl.replace(
    /\/upload\/([^/]+\/)*/,
    "/upload/"
  );

  return cleanUrl
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,w_400/")
    .replace(/\.(mp4|mov|avi|webm|MOV|hevc|3gp|mkv)(\?.*)?$/, ".jpg");
};

export default function VideoPlayer({ url, className = "", maxHeight = "max-h-48" }) {
  if (!url) return null;

  const h264Url   = getH264Url(url);
  const thumbnail = getVideoThumbnail(h264Url);

  return (
    <video
      key={url}
      controls
      preload="metadata"
      playsInline
      poster={thumbnail}
      className={`w-full rounded-xl bg-gray-900 object-cover ${maxHeight} ${className}`}
    >
      <source src={h264Url} type="video/mp4" />
      {/* fallback sur l'URL brute si la transformation échoue */}
      <source src={url} type="video/mp4" />
      <source src={url} type="video/quicktime" />
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
}