import {
  Link,
  useActionData,
  useLoaderData,
  useParams,
  useSubmit,
} from "react-router";
import * as Evolver from "client/services.gen";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { ROUTES } from "~/utils/routes";
import { useFormErrorNotifications } from "~/utils/useFormErrorNotifications";
import type { Route } from "./+types/devices.$id.$name.hardware.$hardware_name.calibrate";
import { DefaultHydrateFallback } from "~/components/HydrateFallback";
import {
  CalibrationProcedure,
  CalibrationProcedureControls,
  CalibrationProcedureProgress,
} from "~/components/CalibrationProcedure";

export interface ProcedureAction {
  name: string;
  description: string;
  input_schema: object;
}

export interface ProcedureState {
  completed_actions: string[];
  created: string;
  dir: string;
  expire: string;
  fitted_calibrator?: object;
  history: ProcedureAction[];
  measured: object;
  name?: string;
  started: boolean;
}

export const ProcedureIntent = z.enum(
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

const baseSchema = z.object({
  id: z.string(),
  hardware_name: z.string(),
  url: z.string().url(),
});

const schema = z.discriminatedUnion("intent", [
  baseSchema.extend({
    intent: z.literal(ProcedureIntent.Enum.dispatch_action),
    action_name: z.string(),
    payload: z.string(),
  }),
  baseSchema.extend({
    intent: z.literal(ProcedureIntent.Enum.start_calibration_procedure),
    procedure_file: z.string().optional(),
  }),
  baseSchema.extend({
    intent: z.literal(ProcedureIntent.Enum.save_calibration_procedure),
  }),
  baseSchema.extend({
    intent: z.literal(ProcedureIntent.Enum.resume_calibration_procedure),
  }),
  baseSchema.extend({
    intent: z.literal(ProcedureIntent.Enum.undo),
  }),
  baseSchema.extend({
    intent: z.literal(ProcedureIntent.Enum.apply_calibration_procedure),
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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    return { ...submission.reply(), success: false };
  }

  const { intent, url } = submission.value;

  try {
    const evolverClient = createEvolverClient(url);

    switch (intent) {
      case ProcedureIntent.Enum.dispatch_action:
        return {
          ...((
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
            )
          ).data as object),
          success: true,
        };

      case ProcedureIntent.Enum.resume_calibration_procedure:
        return {
          ...((
            await Evolver.resumeCalibrationProcedureHardwareHardwareNameCalibratorProcedureResumePost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                client: evolverClient,
              },
            )
          ).data as object),
          success: true,
        };
      case ProcedureIntent.Enum.start_calibration_procedure:
        return {
          ...((
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
            )
          ).data as object),
          success: true,
        };

      case ProcedureIntent.Enum.save_calibration_procedure:
        return {
          ...((
            await Evolver.saveCalibrationProcedureHardwareHardwareNameCalibratorProcedureSavePost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                client: evolverClient,
              },
            )
          ).data as object),
          success: true,
        };
      case ProcedureIntent.Enum.apply_calibration_procedure:
        return {
          ...((
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
            )
          ).data as object),
          success: true,
        };
      case ProcedureIntent.Enum.undo:
        return {
          ...((
            await Evolver.undoCalibrationProcedureActionHardwareHardwareNameCalibratorProcedureUndoPost(
              {
                path: {
                  hardware_name: submission.value.hardware_name,
                },
                client: evolverClient,
              },
            )
          ).data as object),
          success: true,
        };
      default:
        return { ...submission.reply(), success: false };
    }
  } catch (error) {
    let errorMessage = "Failed to connect to device";
    if (error instanceof Error) {
      errorMessage = errorMessage + ": " + (error.message || "Unknown error");
    }
    // TODO: confirm the useErrorFormErrorNotifications hook works with this
    return {
      ...submission.reply({
        formErrors: [errorMessage],
      }),
      success: false,
    };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  return {
    device: await deviceInfo.parse(request.headers.get("Cookie")),
  };
}

// Client loader fetches calibration data
export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const { hardware_name } = params;
  const { device } = await serverLoader();
  const evolverClient = createEvolverClient(device.url);

  const [procedureActions, procedureState, hardware] = await Promise.all([
    await Evolver.getCalibratorActionsHardwareHardwareNameCalibratorProcedureActionsGet(
      {
        path: {
          hardware_name: hardware_name ?? "",
        },
        client: evolverClient,
      },
    ),

    await Evolver.getCalibratorStateHardwareHardwareNameCalibratorProcedureStateGet(
      {
        path: {
          hardware_name: hardware_name ?? "",
        },
        client: evolverClient,
      },
    ),

    await Evolver.getHardwareHardwareHardwareNameGet({
      path: {
        hardware_name: hardware_name ?? "",
      },
      client: evolverClient,
    }),
  ]);

  const calibrationFile =
    (hardware.data as { calibrator?: { calibration_file?: string } }).calibrator
      ?.calibration_file || "";
  const procedureFile =
    (hardware.data as { calibrator?: { procedure_file?: string } }).calibrator
      ?.procedure_file || "";

  return {
    actions: (
      procedureActions.data as {
        actions: ProcedureAction[];
      }
    ).actions as ProcedureAction[],
    state: procedureState.data as ProcedureState,
    calibrationFile,
    procedureFile,
    device,
  };
}

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
}

export function ErrorBoundary() {
  const { device } = useLoaderData<typeof clientLoader>();
  const submit = useSubmit();
  const { id, hardware_name } = useParams();
  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto flex flex-col gap-4">
      <CalibrationProcedureControls
        started={false}
        calibrationFile=""
        currentProcedureFile=""
        calibrationProcedureIsComplete={false}
        url={device.url}
        submit={submit}
        id={id ?? ""}
        hardware_name={hardware_name ?? ""}
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
  const {
    actions,
    state,
    calibrationFile,
    procedureFile,
    device: { url },
  } = useLoaderData<typeof clientLoader>();

  const { id, hardware_name } = useParams<Route.LoaderArgs["params"]>();
  const actionData = useActionData<typeof clientAction>();
  const submit = useSubmit();
  const calibrationProcedureIsComplete =
    state?.completed_actions?.length === actions?.length;

  useFormErrorNotifications(actionData);

  const started = state?.started ?? false;
  const hasHistory = state?.history && state?.history.length > 0;

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      <div className="flex flex-col gap-4">
        <CalibrationProcedureControls
          started={started}
          hasHistory={hasHistory}
          calibrationFile={calibrationFile}
          currentProcedureFile={procedureFile}
          calibrationProcedureIsComplete={calibrationProcedureIsComplete}
          url={url}
          id={id ?? ""}
          hardware_name={hardware_name ?? ""}
          submit={submit}
        />
        {started && (
          <div>
            <div>
              {state && (
                <CalibrationProcedureProgress state={state} actions={actions} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {started && state && id && hardware_name && (
                <CalibrationProcedure
                  state={state}
                  actions={actions}
                  url={url}
                  id={id}
                  hardware_name={hardware_name}
                  submit={submit}
                />
              )}
            </div>
          </div>
        )}
        {!started && (
          <div className="flex flex-col items-center justify-center p-4 bg-base-300 rounded-box relative overflow-x-auto">
            <div className="card bg-base-100  shadow-xl">
              <div className="card-body">
                <p>no running calibration procedure detected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
