import { useRef, useState } from 'react';
import { FiCamera, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import UserAvatar from '@/components/common/UserAvatar.jsx';
import Button from '@/components/ui/Button.jsx';
import { getApiErrorMessage } from '@/helpers/apiError.js';

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfileAvatarUpload({
  user,
  onUpload,
  onRemove,
  isUploading,
  size = 'xl',
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      toast.error('Use JPEG, PNG, or WebP images only');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Image must be smaller than 2 MB');
      return;
    }
    try {
      await onUpload(file);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = async () => {
    try {
      await onRemove();
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:items-start">
      <div
        className={`relative rounded-full p-1 transition ${dragOver ? 'ring-4 ring-brand-forest/25' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <UserAvatar user={user} size={size} ring className="ring-brand-forest/15" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-forest text-white shadow-md transition hover:bg-brand-forestDark disabled:opacity-60"
          aria-label="Upload profile photo"
        >
          <FiCamera className="text-base" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <FiUploadCloud /> Upload photo
        </Button>
        {user?.avatar?.url && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={isUploading}>
            <FiTrash2 /> Remove
          </Button>
        )}
      </div>
      <p className="max-w-xs text-center text-[12px] leading-relaxed text-ios-secondary sm:text-left">
        JPEG, PNG or WebP · Max 2 MB · Shown in the header and across the app
      </p>
    </div>
  );
}
