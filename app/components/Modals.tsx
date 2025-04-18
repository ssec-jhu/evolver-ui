import { XMarkIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";

export function WarningModal({
  onClick,
  warningMessage,
  warningTitle = "warning",
  modalId,
  submitText = "ok",
  submitClassname = "btn",
  children,
  active = true,
  showInputField = false,
  inputLabel = "Input",
  inputPlaceholder = "Enter value",
  onInputChange,
}: {
  onClick: () => void;
  warningTitle?: string;
  warningMessage: string;
  modalId: string;
  submitText?: string;
  submitClassname?: string | ReactNode;
  children: ReactNode;
  active?: boolean;
  showInputField?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  onInputChange?: (value: string) => void;
}) {
  return (
    <div>
      <button
        onClick={() => active && document?.getElementById(modalId)?.showModal()}
      >
        {children}
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
          {showInputField && (
            <div className="flex flex-col gap-4 form-control w-full">
              <label className="label" htmlFor="modalInput">
                <span className="label-text">{inputLabel}</span>
              </label>
              <input
                id="modalInput"
                type="text"
                placeholder={inputPlaceholder}
                className="input input-bordered w-full"
                onChange={(e) => onInputChange?.(e.target.value)}
              />
            </div>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className={submitClassname} onClick={onClick}>
                {submitText}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
