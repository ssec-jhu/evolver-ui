import { createClient } from "@hey-api/client-fetch";
import { toast as notify } from "react-toastify";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useParams,
  useSubmit,
} from "@remix-run/react";
import * as Evolver from "client/services.gen";
import CalibratorActionForm from "~/components/CalibratorActionForm.client";
import { ClientOnly } from "remix-utils/client-only";
import { db } from "~/utils/db.server";
import clsx from "clsx";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useEffect, useState } from "react";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { WarningModal } from "~/components/Modals";

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
    const linkTo = `/devices/${id}/${name}/hardware/${hardware_name}/`;
    if (queryParams !== undefined) {
      linkTo.concat(`?${queryParams.toString()}`);
    }
    return <Link to={linkTo}>calibrate</Link>;
  },
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // prelim validation, just checks request has proper intent and fields for that action intent
  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent, id } = submission.value;

  // use the db to get the url for that device id...(used to init the client)
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  if (!targetDevice) {
    return submission.reply({ formErrors: ["device not found"] });
  }

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

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
        return procedureState.data;
      } catch (error) {
        return submission.reply({ formErrors: ["unable to dispatch action"] });
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
        return procedureState.data;
      } catch (error) {
        return submission.reply({
          formErrors: [
            "unable to resume calibration, confirm calibrator.dir & calibrator.calibration_file attributes exist for this hardware, and the file exists on the evolver device filesystem. If this is a new hardware, make sure to start the calibration procedure first.",
          ],
        });
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
        return procedureState.data;
      } catch (error) {
        return submission.reply({
          formErrors: [
            "unable to save calibration, confirm calibrator.dir & calibrator.calibration_file attributes exist for this hardware, and the file exists on the evolver device filesystem.",
          ],
        });
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
        return procedureState.data;
      } catch (error) {
        return submission.reply({
          formErrors: [
            "unable to save calibration, confirm calibrator.dir & calibrator.calibration_file attributes exist for this hardware, and the file exists on the evolver device filesystem.",
          ],
        });
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
        return procedureState.data;
      } catch (error) {
        return submission.reply({
          formErrors: [
            "unable to apply calibration, confirm calibration_file parameter is correct and exists on the evolver device filesystem.",
          ],
        });
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
        return procedureState.data;
      } catch (error) {
        return submission.reply({ formErrors: ["unable to dispatch action"] });
      }
    default:
      return submission.reply();
  }
  return submission.reply({
    formErrors: ["unknown error"],
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id, hardware_name } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });
  const { url } = targetDevice ?? { url: "" };
  const evolverClient = createClient({
    baseUrl: url,
  });
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
  const { data: hardware } = await Evolver.getHardwareHardwareHardwareNameGet({
    path: {
      hardware_name: hardware_name ?? "",
    },
    client: evolverClient,
  });

  const calibrationFile = hardware?.calibrator?.calibration_file || "";
  const procedureFile = hardware?.calibrator?.procedure_file || "";

  return {
    actions: procedureActions?.actions,
    state: procedureState,
    calibrationFile,
    procedureFile,
  };
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
      <ClientOnly
        key={action.description}
        fallback={<span className="skeleton h-32"></span>}
      >
        {() => (
          <CalibratorActionForm
            action={{ ...action, is_complete: isComplete }}
            index={ix}
            dispatchAction={dispatchAction}
          />
        )}
      </ClientOnly>
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
    useLoaderData<typeof loader>();

  console.log("calibrationFile", calibrationFile);
  console.log("procedureFile", procedureFile);
  const actionData = useActionData<typeof action>();
  const calibrationProcedureIsComplete =
    state?.completed_actions?.length === actions?.length;

  useEffect(() => {
    if (actionData?.error) {
      if (typeof actionData.error === "string") {
        notify.error(actionData.error);
      }
      if (typeof actionData.error === "object") {
        Object.entries(actionData.error).forEach(([key, value]) => {
          notify.error(`${key}: ${value}`);
        });
      }
    }
  }, [actionData]);

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
          <div className="card bg-base-100  shadow-xl">
            <div className="card-body">
              <p>no running calibration procedure detected</p>
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
