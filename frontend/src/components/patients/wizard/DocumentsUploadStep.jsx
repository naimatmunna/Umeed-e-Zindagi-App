import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload, FiFile, FiImage, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { cn } from '@/lib/classNames.js';
import { DOCUMENT_TYPES, REQUIRED_DOCUMENT_TYPES } from '@/constants/patient.js';
import {
  MAX_DOCUMENT_SIZE,
  validateDocumentFile,
} from '@/components/patients/wizard/wizardValidation.js';

const ACCEPT_LABEL = 'JPEG, PNG, WebP, PDF';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentCard({
  type,
  required,
  pending,
  existing,
  error,
  onSelect,
  onRemove,
  onDownload,
  t,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(100);

  const hasFile = Boolean(pending?.file || existing);
  const fileName = pending?.file?.name ?? existing?.label ?? existing?.url?.split('/').pop();
  const isImage =
    pending?.previewUrl ||
    (existing?.mimeType?.startsWith('image/') ?? existing?.url?.match(/\.(jpe?g|png|webp)$/i));

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;
      setProgress(0);
      const tick = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(tick);
            return 100;
          }
          return p + 20;
        });
      }, 60);
      onSelect(type, file);
    },
    [onSelect, type],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <article
      className={cn(
        'flex flex-col rounded-ios-lg border bg-ios-card p-4 shadow-ios transition',
        error ? 'border-ios-red ring-1 ring-ios-red/30' : 'border-ios-separator/30',
        dragOver && 'border-ios-blue bg-ios-blue/5',
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-[15px] font-semibold leading-snug text-ios-label">{t(`documents.types.${type}`)}</h4>
          <p className="mt-1 text-[12px] leading-relaxed text-ios-secondary">{t(`documents.descriptions.${type}`)}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            required ? 'bg-ios-red/10 text-ios-red' : 'bg-ios-bg text-ios-secondary',
          )}
        >
          {required ? t('documents.required') : t('documents.optional')}
        </span>
      </div>

      {!hasFile ? (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-ios border-2 border-dashed border-ios-separator/50 bg-ios-bg/50 px-4 py-6 text-center transition hover:border-ios-blue hover:bg-ios-blue/5"
        >
          <FiUploadCloud className="mb-2 text-2xl text-ios-blue" aria-hidden />
          <p className="text-[14px] font-medium text-ios-label">{t('documents.dropOrClick')}</p>
          <p className="mt-1 text-[12px] text-ios-secondary">
            {ACCEPT_LABEL} · {t('documents.maxSize', { size: '10 MB' })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {isImage && pending?.previewUrl && (
            <img
              src={pending.previewUrl}
              alt=""
              className="h-28 w-full rounded-ios object-cover"
            />
          )}
          {!pending?.previewUrl && isImage && existing?.url && (
            <img src={existing.url} alt="" className="h-28 w-full rounded-ios object-cover" />
          )}
          <div className="flex items-center gap-3 rounded-ios bg-ios-bg px-3 py-2">
            {isImage ? <FiImage className="text-ios-blue" /> : <FiFile className="text-ios-blue" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-ios-label">{fileName}</p>
              <p className="text-[12px] text-ios-secondary">
                {formatBytes(pending?.file?.size ?? existing?.size)}
              </p>
            </div>
          </div>
          {pending?.file && progress < 100 && (
            <div className="h-1.5 overflow-hidden rounded-full bg-ios-bg">
              <div className="h-full bg-ios-blue transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-ios border border-ios-separator/40 px-3 text-[13px] font-medium text-ios-label hover:bg-ios-bg"
              onClick={() => inputRef.current?.click()}
            >
              <FiUploadCloud /> {t('documents.replace')}
            </button>
            {(pending?.file || !existing) && (
              <button
                type="button"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-ios border border-ios-red/30 px-3 text-[13px] font-medium text-ios-red hover:bg-ios-red/5"
                onClick={() => onRemove(type)}
              >
                <FiTrash2 /> {t('documents.remove')}
              </button>
            )}
            {existing?.url && !pending?.file && (
              <a
                href={existing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-ios border border-ios-separator/40 px-3 text-[13px] font-medium text-ios-blue hover:bg-ios-bg"
                onClick={(e) => {
                  if (onDownload) {
                    e.preventDefault();
                    onDownload(existing);
                  }
                }}
              >
                <FiDownload /> {t('documents.download')}
              </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[13px] text-ios-red" role="alert">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </article>
  );
}

export default function DocumentsUploadStep({
  pendingDocuments,
  existingDocuments,
  onDocumentChange,
  onDocumentRemove,
  getFieldError,
  touch,
}) {
  const { t } = useTranslation('patient');

  const missingRequired = useMemo(
    () =>
      REQUIRED_DOCUMENT_TYPES.filter(
        (type) => !pendingDocuments[type]?.file && !existingDocuments[type],
      ),
    [pendingDocuments, existingDocuments],
  );

  const displayTypes = useMemo(() => {
    const primary = ['patient_photo', 'cnic_front', 'cnic_back', 'guardian_cnic', 'consent_form'];
    const rest = DOCUMENT_TYPES.filter((d) => !primary.includes(d));
    return [...primary, ...rest];
  }, []);

  const handleSelect = (type, file) => {
    const err = validateDocumentFile(file, t);
    if (err) {
      touch(`documents.${type}`);
      onDocumentChange(type, file, err);
      return;
    }
    onDocumentChange(type, file, '');
    touch(`documents.${type}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-ios bg-ios-bg px-4 py-3">
        <p className="text-[14px] font-medium text-ios-label">{t('documents.sectionTitle')}</p>
        <p className="mt-1 text-[13px] text-ios-secondary">{t('documents.sectionHint')}</p>
      </div>

      {missingRequired.length > 0 && (
        <div className="rounded-ios border border-ios-orange/40 bg-ios-orange/8 px-4 py-3" role="alert">
          <p className="text-[14px] font-semibold text-ios-label">{t('documents.missingTitle')}</p>
          <ul className="mt-2 list-inside list-disc text-[13px] text-ios-secondary">
            {missingRequired.map((type) => (
              <li key={type}>{t(`documents.types.${type}`)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayTypes.map((type) => (
          <DocumentCard
            key={type}
            type={type}
            required={REQUIRED_DOCUMENT_TYPES.includes(type)}
            pending={pendingDocuments[type]}
            existing={existingDocuments[type]}
            error={getFieldError(`documents.${type}`) || pendingDocuments[type]?.error}
            onSelect={handleSelect}
            onRemove={onDocumentRemove}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
