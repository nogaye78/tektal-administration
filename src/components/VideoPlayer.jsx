const getH264Url = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url
    .replace("/upload/", "/upload/vc_h264,ac_aac,f_mp4/")
    .replace(/\.(mov|MOV|hevc|HEVC|avi|AVI|3gp|3GP)$/, ".mp4");
};

export default function VideoPlayer({ url, className = "", maxHeight = "max-h-48" }) {
  if (!url) return null;
  const compatibleUrl = getH264Url(url);

  return (
    <video
      key={compatibleUrl}
      controls
      preload="metadata"
      playsInline
      className={`w-full rounded-xl bg-gray-900 ${maxHeight} ${className}`}
    >
      <source src={compatibleUrl} type="video/mp4" />
      <source src={url} type="video/mp4" />
      <source src={url} type="video/quicktime" />
    </video>
  );
}