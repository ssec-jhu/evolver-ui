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
  showProcedureFileInput = false,
  onProcedureFileChange,
}: {
  onClick: () => void;
  warningTitle?: string;
  warningMessage: string;
  modalId: string;
  submitText?: string;
  submitClassname?: string | ReactNode;
  children: ReactNode;
  active?: boolean;
  showProcedureFileInput?: boolean;
  onProcedureFileChange?: (value: string) => void;
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
          {showProcedureFileInput && (
            <div className="flex flex-col gap-4 form-control w-full">
              <label className="label" htmlFor="procedureFileInput">
                <span className="label-text">procedure_file name</span>
              </label>
              <input
                id="procedureFileInput"
                type="text"
                placeholder="enter procedure_file name"
                className="input input-bordered w-full"
                onChange={(e) => onProcedureFileChange?.(e.target.value)}
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
