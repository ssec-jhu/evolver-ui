import type { SubmitFunction } from "react-router";
import {
  ProcedureIntent,
  type ProcedureAction,
  type ProcedureState,
} from "~/routes/devices.$id.$name.hardware.$hardware_name.calibrate";
import CalibratorActionForm from "./CalibratorActionForm";
import { useState } from "react";
import { WarningModal } from "./Modals";
import clsx from "clsx";

export function CalibrationProcedure({
  actions,
  state,
  url,
  id,
  hardware_name,
  submit,
}: {
  actions: ProcedureAction[];
  state: ProcedureState;
  url: string;
  id: string;
  hardware_name: string;
  submit: SubmitFunction;
}) {
  return actions.map((action, ix) => {
    const isComplete = state?.completed_actions?.includes(action.name) ?? false;
    const dispatchAction = (actionFormData: object) => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("url", url);
      formData.append("intent", ProcedureIntent.Enum.dispatch_action);
      formData.append("hardware_name", hardware_name ?? "");
      formData.append("action_name", action.name);
      formData.append("payload", JSON.stringify(actionFormData));
      submit(formData, {
        method: "POST",
      });
    };
    return (
      <CalibratorActionForm
        key={action.name}
        action={{ ...action, is_complete: isComplete }}
        index={ix}
        dispatchAction={dispatchAction}
      />
    );
  });
}

export function CalibrationProcedureProgress({
  state,
  actions,
}: {
  state: ProcedureState;
  actions: ProcedureAction[];
}) {
  const completed = state.completed_actions.length;
  const total = actions.length;
  return (
    <div className="flex flex-col gap-3">
      <div className="font-mono">progress</div>
      <progress
        className="progress progress-accent w-full"
        value={completed}
        max={total}
      />
      <div className="flex justify-end">
        {completed}/{total}
      </div>
    </div>
  );
}

export function CalibrationProcedureControls({
  hasHistory = false,
  started = false,
  calibrationFile,
  currentProcedureFile,
  calibrationProcedureIsComplete,
  url,
  id,
  hardware_name,
  submit,
}: {
  hasHistory?: boolean;
  started: boolean;
  calibrationFile: string;
  currentProcedureFile: string;
  calibrationProcedureIsComplete: boolean;
  url: string;
  id: string;
  hardware_name: string;
  submit: SubmitFunction;
}) {
  const [procedureFile, setProcedureFile] = useState("");
  const [calibrationFileName, setCalibrationFileName] =
    useState(calibrationFile);
  const startProcedureWarningMessage = currentProcedureFile
    ? `There is already a procedure_file associated with this hardware, ${currentProcedureFile}, are you sure you want to start a new procedure? If you use the same name, any procedure state stored in ${currentProcedureFile} will be overwritten. Choose a new procedure_file name to start fresh, otherwise consider resuming the procedure.`
    : `This will start a new calibration procedure and create a new procedure_file file to store procedure state on the device.`;

  const applyProcedureWarningMessage = `Apply the calibration procedure. This will copy procedure state currently stored in the procedure_file ${currentProcedureFile} to the calibration_file. Data in the calibration_file is used to calibrate the hardware. Please specify a calibration file name.`;

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex items-center">
        <div>
          <div className="flex w-full font-sans font-semibold">
            calibration procedure
          </div>
        </div>
      </div>
      <div className="flex">
        {!started && (
          <div className="flex">
            <WarningModal
              modalId="start_procedure_modal"
              submitText="start"
              warningMessage={startProcedureWarningMessage}
              showInputField={false}
              inputLabel="procedure_file name"
              inputPlaceholder="enter procedure_file name"
              onInputChange={(value) => {
                setProcedureFile(value);
              }}
              onClick={() => {
                const formData = new FormData();
                formData.append("id", id);
                formData.append("url", url);
                formData.append(
                  "intent",
                  ProcedureIntent.Enum.start_calibration_procedure,
                );
                formData.append("hardware_name", hardware_name ?? "");
                if (procedureFile) {
                  formData.append("procedure_file", procedureFile);
                }
                submit(formData, {
                  method: "POST",
                });
              }}
            >
              <span className={clsx("btn")}>start</span>
            </WarningModal>
            <div className="divider divider-horizontal"></div>
          </div>
        )}

        {started && (
          <div className="flex">
            <WarningModal
              active={hasHistory}
              modalId="restart_procedure_modal"
              submitText="restart"
              warningMessage={`
                    restarting the calibration procedure will reset all unsaved
                    progress.
              `}
              showInputField={false}
              inputLabel="procedure_file name"
              inputPlaceholder="enter procedure_file name"
              onInputChange={(value) => {
                setProcedureFile(value);
              }}
              onClick={() => {
                const formData = new FormData();
                formData.append("id", id ?? "");
                formData.append("url", url);
                formData.append(
                  "intent",
                  ProcedureIntent.Enum.start_calibration_procedure,
                );
                formData.append("hardware_name", hardware_name ?? "");
                if (procedureFile) {
                  formData.append("procedure_file", procedureFile);
                }
                submit(formData, {
                  method: "POST",
                });
              }}
            >
              <span
                className={clsx(
                  "btn",
                  started && "btn-error",
                  !hasHistory && "btn-disabled",
                )}
              >
                restart
              </span>
            </WarningModal>
            <div className="divider divider-horizontal"></div>
          </div>
        )}

        {!started && (
          <button
            className={clsx("btn", "btn-primary")}
            onClick={() => {
              const formData = new FormData();
              formData.append("id", id ?? "");
              formData.append("url", url);
              formData.append(
                "intent",
                ProcedureIntent.Enum.resume_calibration_procedure,
              );
              formData.append("hardware_name", hardware_name ?? "");
              submit(formData, {
                method: "POST",
              });
            }}
          >
            resume
          </button>
        )}

        {started && (
          <div className="flex gap-4">
            <button
              className={clsx(
                "btn",
                "btn-secondary",
                !hasHistory && "btn-disabled",
              )}
              onClick={() => {
                const formData = new FormData();
                formData.append("id", id ?? "");
                formData.append("url", url);
                formData.append("intent", ProcedureIntent.Enum.undo);
                formData.append("hardware_name", hardware_name ?? "");
                submit(formData, {
                  method: "POST",
                });
              }}
            >
              undo
            </button>
            <button
              className={clsx(
                "btn",
                "btn-primary",
                !hasHistory && "btn-disabled",
              )}
              onClick={() => {
                const formData = new FormData();
                formData.append("id", id ?? "");
                formData.append("url", url);
                formData.append(
                  "intent",
                  ProcedureIntent.Enum.save_calibration_procedure,
                );
                formData.append("hardware_name", hardware_name ?? "");
                submit(formData, {
                  method: "POST",
                });
              }}
            >
              save
            </button>
          </div>
        )}
        {started && (
          <div className="flex">
            <div className="divider divider-horizontal"></div>
            <WarningModal
              active={calibrationProcedureIsComplete}
              modalId="apply_procedure_modal"
              submitText="apply"
              warningMessage={applyProcedureWarningMessage}
              showInputField={true}
              inputLabel="calibration_file name"
              inputPlaceholder="enter calibration_file name"
              onInputChange={(value) => {
                setCalibrationFileName(value);
              }}
              onClick={() => {
                const formData = new FormData();
                formData.append("id", id ?? "");
                formData.append("url", url);
                formData.append(
                  "intent",
                  ProcedureIntent.Enum.apply_calibration_procedure,
                );
                formData.append("hardware_name", hardware_name ?? "");
                formData.append("calibration_file", calibrationFileName);
                submit(formData, {
                  method: "POST",
                });
              }}
            >
              <span
                className={clsx(
                  "btn",
                  "btn-accent",
                  !calibrationProcedureIsComplete && "btn-disabled",
                )}
              >
                apply
              </span>
            </WarningModal>
          </div>
        )}
      </div>
    </div>
  );
}
