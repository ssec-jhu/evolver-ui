import { XMarkIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";

export function WarningModal({
  onClick,
  warningMessage,
  warningTitle = "warning",
  modalId,
  submitText = "ok",
  triggerClassname,
  triggerText,
}: {
  onClick: () => void;
  warningTitle?: string;
  warningMessage: string;
  modalId: string;
  submitText?: string;
  triggerClassname: ReactNode;
  triggerText: string;
}) {
  return (
    <div>
      <button
        className={triggerClassname as string}
        onClick={() => document?.getElementById(modalId)?.showModal()}
      >
        {triggerText}
      </button>
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <XMarkIcon />
            </button>
          </form>
          <h3 className="text-lg">{warningTitle}</h3>
          <p className="py-4">{warningMessage}</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-error" onClick={onClick}>
                {submitText}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
