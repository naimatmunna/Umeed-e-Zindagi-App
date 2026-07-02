import { useEffect } from 'react';
import { FiX, FiZoomIn } from 'react-icons/fi';

export default function PhotoGrid({ images, columns = 'default', aspect = 'square', onPreview }) {
  const colClass =
    columns === 'certificates'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  const aspectClass =
    aspect === 'landscape'
      ? 'aspect-[4/3]'
      : aspect === 'certificate'
        ? 'aspect-[3/4] sm:aspect-[4/5]'
        : 'aspect-square';

  return (
    <div className={`grid gap-3 sm:gap-4 ${colClass}`}>
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => onPreview?.(src, i)}
          className={`group relative overflow-hidden rounded-ios-lg border border-ios-separator/30 bg-brand-cream shadow-ios transition hover:-translate-y-0.5 hover:shadow-ios-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 ${aspectClass}`}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-forestDark/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-forest opacity-0 shadow-sm transition group-hover:opacity-100">
            <FiZoomIn className="h-4 w-4" />
          </span>
        </button>
      ))}
    </div>
  );
}

export function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-forestDark/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close preview"
      >
        <FiX className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[min(100%,56rem)] rounded-ios-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
