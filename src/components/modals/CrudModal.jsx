import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function CrudModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Save",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
    >
      <div className="space-y-6">
        {children}

        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={onSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}