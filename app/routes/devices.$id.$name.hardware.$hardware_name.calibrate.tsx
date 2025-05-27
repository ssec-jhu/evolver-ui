import {
  Link,
  useActionData,
  useLoaderData,
  useParams,
  useSubmit,
} from "react-router";
import * as Evolver from "client/services.gen";
import CalibratorActionForm from "~/components/CalibratorActionForm";
import clsx from "clsx";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { WarningModal } from "~/components/Modals";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { ROUTES } from "~/utils/routes";
import { useFormErrorNotifications } from "~/utils/useFormErrorNotifications";
import type { Route } from "./+types/devices.$id.$name.hardware.$hardware_name.calibrate";

const Intent = z.enum(
  [
    "dispatch_action",
    "start_calibration_procedure",
    "save_calibration_procedure",
    "resume_calibration_procedure",
    "undo",
    "apply_calibration_procedure",
  ],
  {
    required_error: "intent is required",
    invalid_type_error:
      "must be one of: dispatch_action, start_calibration_procedure, undo, apply_calibration_procedure",
  },
);

const schema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal(Intent.Enum.dispatch_action),
    id: z.string(),
    hardware_name: z.string(),
    action_name: z.string(),
    payload: z.string(),
  }),
  z.object({
    intent: z.literal(Intent.Enum.start_calibration_procedure),
    id: z.string(),
    hardware_name: z.string(),
    procedure_file: z.string().optional(),
  }),
  z.object({
    intent: z.literal(Intent.Enum.save_calibration_procedure),
    id: z.string(),
    hardware_name: z.string(),
  }),
  z.object({
    intent: z.literal(Intent.Enum.resume_calibration_procedure),
    id: z.string(),
    hardware_name: z.string(),
  }),
  z.object({
    intent: z.literal(Intent.Enum.undo),
    id: z.string(),
    hardware_name: z.string(),
  }),
  z.object({
    intent: z.literal(Intent.Enum.apply_calibration_procedure),
    id: z.string(),
    hardware_name: z.string(),
    calibration_file: z.string(),
  }),
]);

export const handle = {
  breadcrumb: (
    {
      params,
    }: {
      params: { id: string; hardware_name: string; name: string };
    },
    queryParams?: URLSearchParams,
  ) => {
    const { id, hardware_name, name } = params;
    const baseLinkTo = ROUTES.device.hardware.calibrate({
      id,
      name,
      hardwareName: hardware_name,
    });
    const linkTo =
      queryParams !== undefined
        ? `${baseLinkTo}?${queryParams.toString()}`
        : baseLinkTo;
    return <Link to={linkTo}>calibrate</Link>;
  },
};

// Client action handles calibration procedures
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  // prelim validation, just checks request has proper intent and fields for that action intent
  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    return { ...submission.reply(), success: false };
  }
  const { intent, id } = submission.value;

  try {
    // Get device URL from cookie
    const cookieHeader = request.headers.get("Cookie");
    const deviceData = await deviceInfo.parse(cookieHeader);

    if (!deviceData?.url) {
      return {
        ...submission.reply({
          formErrors: ["Device URL not found. Please refresh the page."],
        }),
        success: false,
      };
    }

    const evolverClient = createEvolverClient(deviceData.url);

    switch (intent) {
      case Intent.Enum.dispatch_action:
        try {
          const procedureState =
            await Evolver.dispatchCalibratorActionHardwareHardwareNameCalibratorProcedureDispatchPost(
              {
                body: {
                  action_name: submission.value.action_name,
                  payload: JSON.parse(submission.value.payload),
                },
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                client: evolverClient,
              },
            );
          return { ...procedureState.data, success: true };
        } catch (error) {
          return {
            ...submission.reply({
              formErrors: ["unable to dispatch action"],
            }),
            success: false,
          };
        }

      case Intent.Enum.resume_calibration_procedure:
        try {
          const procedureState =
            await Evolver.resumeCalibrationProcedureHardwareHardwareNameCalibratorProcedureResumePost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                client: evolverClient,
              },
            );
          return { ...procedureState.data, success: true };
        } catch (error) {
          return {
            ...submission.reply({
              formErrors: [
                "unable to resume calibration, confirm calibrator.dir & calibrator.calibration_file attributes exist for this hardware, and the file exists on the evolver device filesystem. If this is a new hardware, make sure to start the calibration procedure first.",
              ],
            }),
            success: false,
          };
        }
      case Intent.Enum.start_calibration_procedure:
        try {
          const procedureState =
            await Evolver.startCalibrationProcedureHardwareHardwareNameCalibratorProcedureStartPost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                query: {
                  procedure_file: submission.value.procedure_file,
                },
                client: evolverClient,
              },
            );
          return { ...procedureState.data, success: true };
        } catch (error) {
          return {
            ...submission.reply({
              formErrors: ["unable to start calibration"],
            }),
            success: false,
          };
        }

      case Intent.Enum.save_calibration_procedure:
        try {
          const procedureState =
            await Evolver.saveCalibrationProcedureHardwareHardwareNameCalibratorProcedureSavePost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                client: evolverClient,
              },
            );
          return { ...procedureState.data, success: true };
        } catch (error) {
          return {
            ...submission.reply({
              formErrors: [
                "unable to save calibration, confirm calibrator.dir & calibrator.calibration_file attributes exist for this hardware, and the file exists on the evolver device filesystem.",
              ],
            }),
            success: false,
          };
        }
      case Intent.Enum.apply_calibration_procedure:
        try {
          const procedureState =
            await Evolver.applyCalibrationProcedureHardwareHardwareNameCalibratorProcedureApplyPost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                query: {
                  calibration_file: submission.value.calibration_file,
                },
                client: evolverClient,
              },
            );
          return { ...procedureState.data, success: true };
        } catch (error) {
          return {
            ...submission.reply({
              formErrors: [
                "unable to apply calibration, confirm calibration_file parameter is correct and exists on the evolver device filesystem.",
              ],
            }),
            success: false,
          };
        }
      case Intent.Enum.undo:
        try {
          const procedureState =
            await Evolver.undoCalibrationProcedureActionHardwareHardwareNameCalibratorProcedureUndoPost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                client: evolverClient,
              },
            );
          return { ...procedureState.data, success: true };
        } catch (error) {
          return {
            ...submission.reply({
              formErrors: ["unable to undo action"],
            }),
            success: false,
          };
        }
      default:
        return { ...submission.reply(), success: false };
    }
    return {
      ...submission.reply({
        formErrors: ["unknown error"],
      }),
      success: false,
    };
  } catch (error) {
    return {
      ...submission.reply({
        formErrors: [
          "Failed to connect to device: " + (error.message || "Unknown error"),
        ],
      }),
      success: false,
    };
  }
}

// Client loader fetches calibration data
export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const { hardware_name } = params;

  try {
    // Get device URL from cookie
    const cookieHeader = request.headers.get("Cookie");
    const deviceData = await deviceInfo.parse(cookieHeader);

    if (!deviceData?.url) {
      throw new Error("Device URL not found. Please refresh the page.");
    }

    const evolverClient = createEvolverClient(deviceData.url);
    const { data: procedureActions } =
      await Evolver.getCalibratorActionsHardwareHardwareNameCalibratorProcedureActionsGet(
        {
          path: {
            hardware_name: hardware_name ?? "",
          },
          client: evolverClient,
        },
      );

    const { data: procedureState } =
      await Evolver.getCalibratorStateHardwareHardwareNameCalibratorProcedureStateGet(
        {
          path: {
            hardware_name: hardware_name ?? "",
          },
          client: evolverClient,
        },
      );

    // Get hardware details to extract the calibration_file
    const { data: hardware } = await Evolver.getHardwareHardwareHardwareNameGet(
      {
        path: {
          hardware_name: hardware_name ?? "",
        },
        client: evolverClient,
      },
    );

    const calibrationFile = hardware?.calibrator?.calibration_file || "";
    const procedureFile = hardware?.calibrator?.procedure_file || "";

    return {
      actions: procedureActions?.actions,
      state: procedureState,
      calibrationFile,
      procedureFile,
    };
  } catch (error) {
    throw new Error(
      "Failed to load hardware calibration data: " +
        (error.message || "Unknown error"),
    );
  }
}

const CalibrationProcedure = ({ actions, state }) => {
  const submit = useSubmit();
  const { id, hardware_name } = useParams();

  return actions.map((action, ix) => {
    const isComplete = state?.completed_actions?.includes(action.name) ?? false;
    const dispatchAction = (actionFormData: object) => {
      const formData = new FormData();
      formData.append("id", id ?? "");
      formData.append("intent", Intent.Enum.dispatch_action);
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
};

const CalibrationProcedureProgress = ({ state, actions }) => {
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
};

const CalibrationProcedureControls = ({
  hasHistory = false,
  started = false,
  calibrationFile,
  currentProcedureFile,
  calibrationProcedureIsComplete,
}: {
  hasHistory?: boolean;
  started: boolean;
  calibrationFile: string;
  currentProcedureFile: string;
  calibrationProcedureIsComplete: boolean;
}) => {
  const submit = useSubmit();
  const { id, hardware_name } = useParams();
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
          <div className="flex w-full font-mono">calibration procedure</div>
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
                formData.append("id", id ?? "");
                formData.append(
                  "intent",
                  Intent.Enum.start_calibration_procedure,
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
                formData.append(
                  "intent",
                  Intent.Enum.start_calibration_procedure,
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
              formData.append(
                "intent",
                Intent.Enum.resume_calibration_procedure,
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
                formData.append("intent", Intent.Enum.undo);
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
                formData.append(
                  "intent",
                  Intent.Enum.save_calibration_procedure,
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
                formData.append(
                  "intent",
                  Intent.Enum.apply_calibration_procedure,
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
};

export function ErrorBoundary() {
  const { hardware_name } = useParams();
  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto flex flex-col gap-4">
      <CalibrationProcedureControls
        started={false}
        calibrationFile=""
        currentProcedureFile=""
        calibrationProcedureIsComplete={false}
      />
      <div className="card bg-base-100  shadow-xl">
        <div className="card-body">
          <WrenchScrewdriverIcon className="w-10 h-10" />
          <div>
            <div>
              <h1 className="font-mono">{`The calibration procedure encountered an error.
          Make sure there is a calibrator.procedure_file attribute defined on the ${hardware_name} hardware in the config and the procedure has been started`}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalibrateHardware() {
  const { actions, state, calibrationFile, procedureFile } =
    useLoaderData<typeof clientLoader>();

  const actionData = useActionData<typeof clientAction>();
  const calibrationProcedureIsComplete =
    state?.completed_actions?.length === actions?.length;

  useFormErrorNotifications(actionData);

  const started = state?.started ?? false;
  const hasHistory = state?.history && state?.history.length > 0;

  if (!started) {
    return (
      <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
        <div className="flex flex-col gap-4">
          <CalibrationProcedureControls
            started={started}
            calibrationFile={calibrationFile}
            currentProcedureFile={procedureFile}
            calibrationProcedureIsComplete={calibrationProcedureIsComplete}
          />

          <div className="flex flex-col items-center justify-center p-4 bg-base-300 rounded-box relative overflow-x-auto">
            <div className="card bg-base-100  shadow-xl">
              <div className="card-body">
                <p>no running calibration procedure detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      <div className="flex flex-col gap-4">
        <CalibrationProcedureControls
          started={started}
          hasHistory={hasHistory}
          calibrationFile={calibrationFile}
          currentProcedureFile={procedureFile}
          calibrationProcedureIsComplete={calibrationProcedureIsComplete}
        />
        <div>
          <CalibrationProcedureProgress state={state} actions={actions} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {started && <CalibrationProcedure state={state} actions={actions} />}
        </div>
      </div>
    </div>
  );
}
