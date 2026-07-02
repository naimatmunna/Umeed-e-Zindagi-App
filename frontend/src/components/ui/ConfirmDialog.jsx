import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  isLoading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-center text-[15px] text-ios-secondary">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
