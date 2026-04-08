import { useEffect, useState } from "react";

const MEDIA_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

function resolveWithAnyExtension(fileKey, onResolved) {
  if (!fileKey) {
    onResolved("");
    return () => {};
  }

  let isActive = true;
  let idx = 0;

  const tryNext = () => {
    if (!isActive || idx >= MEDIA_EXTENSIONS.length) {
      onResolved("");
      return;
    }

    const src = `/media/${fileKey}.${MEDIA_EXTENSIONS[idx]}`;
    const img = new Image();
    img.onload = () => isActive && onResolved(src);
    img.onerror = () => {
      idx += 1;
      tryNext();
    };
    img.src = src;
  };

  tryNext();
  return () => {
    isActive = false;
  };
}

function PhotoCard3D({ photo }) {
  const [frontSrc, setFrontSrc] = useState(photo.image || "");
  const [backSrc, setBackSrc] = useState(photo.backImage || "");

  useEffect(() => {
    if (!photo.imageKey) {
      setFrontSrc(photo.image || "");
      return undefined;
    }
    return resolveWithAnyExtension(photo.imageKey, (resolved) => setFrontSrc(resolved || photo.image || ""));
  }, [photo.imageKey, photo.image]);

  useEffect(() => {
    if (!photo.backImageKey) {
      setBackSrc(photo.backImage || "");
      return undefined;
    }
    return resolveWithAnyExtension(photo.backImageKey, (resolved) => setBackSrc(resolved || photo.backImage || ""));
  }, [photo.backImageKey, photo.backImage]);

  return (
    <article className="photo3d-card">
      <div className="photo3d-inner">
        <div className="photo3d-face photo3d-front">
          <img
            src={frontSrc}
            alt={photo.title}
            loading="lazy"
          />
        </div>
        <div className="photo3d-face photo3d-back">
          {backSrc ? (
            <div className="photo3d-back-image-wrap">
              <img src={backSrc} alt={photo.backTitle || `${photo.title} back`} loading="lazy" />
              <div className="photo3d-back-caption">
                <h4>{photo.backTitle}</h4>
                <p>{photo.backText}</p>
              </div>
            </div>
          ) : (
            <>
              <h4>{photo.backTitle}</h4>
              <p>{photo.backText}</p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default PhotoCard3D;
