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
import { useEffect } from "react";
import { WrenchScrewdriverIcon, XMarkIcon } from "@heroicons/react/24/solid";

const Intent = z.enum(
  ["dispatch_action", "start_calibration_procedure", "undo"],
  {
    required_error: "intent is required",
    invalid_type_error:
      "must be one of: dispatch_action, start_calibration_procedure, undo",
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
  }),
  z.object({
    intent: z.literal(Intent.Enum.undo),
    id: z.string(),
    hardware_name: z.string(),
  }),
]);

export const handle = {
  breadcrumb: (
    {
      params,
    }: {
      params: { id: string; hardware_name: string };
    },
    queryParams?: URLSearchParams,
  ) => {
    const { id, hardware_name } = params;
    const linkTo = `/devices/${id}/hardware/${hardware_name}/`;
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

    case Intent.Enum.start_calibration_procedure:
      try {
        const procedureState =
          await Evolver.startCalibrationProcedureHardwareHardwareNameCalibratorProcedureStartPost(
            {
              path: {
                hardware_name: submission.value.hardware_name,
                resume: false,
              },
              client: evolverClient,
            },
          );
        return procedureState.data;
      } catch (error) {
        return submission.reply({
          formErrors: ["unable to start calibration"],
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

  return {
    actions: procedureActions?.actions,
    state: procedureState,
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
}: {
  hasHistory?: boolean;
  started: boolean;
}) => {
  const submit = useSubmit();
  const { id, hardware_name } = useParams();
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex items-center">
        <div>
          <div className="flex w-full font-mono">calibration procedure</div>
        </div>
      </div>
      <div className="flex gap-4">
        {started && (
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
        )}
        {!started && (
          <button
            className={clsx("btn", "btn-accent")}
            onClick={() => {
              const formData = new FormData();
              formData.append("id", id ?? "");
              formData.append(
                "intent",
                Intent.Enum.start_calibration_procedure,
              );
              formData.append("hardware_name", hardware_name ?? "");
              submit(formData, {
                method: "POST",
              });
            }}
          >
            start
          </button>
        )}

        {started && (
          <div>
            <button
              className={clsx(
                "btn",
                started && "btn-error",
                !hasHistory && "btn-disabled",
              )}
              onClick={() =>
                document?.getElementById("restart_procedure_modal")?.showModal()
              }
            >
              restart
            </button>
            <dialog id="restart_procedure_modal" className="modal">
              <div className="modal-box">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <XMarkIcon />
                  </button>
                </form>
                <h3 className="text-lg">warning</h3>
                <p className="py-4">
                  restarting the calibration procedure will reset all progress.
                </p>
                <div className="modal-action">
                  <form method="dialog">
                    <button
                      className={clsx("btn", "btn-error")}
                      onClick={() => {
                        const formData = new FormData();
                        formData.append("id", id ?? "");
                        formData.append(
                          "intent",
                          Intent.Enum.start_calibration_procedure,
                        );
                        formData.append("hardware_name", hardware_name ?? "");
                        submit(formData, {
                          method: "POST",
                        });
                      }}
                    >
                      restart
                    </button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export function ErrorBoundary() {
  return (
    <div className="flex flex-col gap-4 bg-base-300 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`The calibration procedure encountered an error.
          Make sure there is a procedure defined on the hardware in the config and the procedure has been started`}</h1>
        </div>
      </div>
    </div>
  );
}

export default function CalibrateHardware() {
  const { actions, state } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

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
      <div>
        <div className="flex flex-col gap-4">
          <CalibrationProcedureControls started={started} />
          <div className="card bg-base-100  shadow-xl">
            <div className="card-body">
              <p>no calibration procedure</p>
              <p>start a calibration procedure to begin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <CalibrationProcedureControls
          started={started}
          hasHistory={hasHistory}
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
