import {
  Outlet,
  Link,
  useParams,
  useLoaderData,
  useLocation,
  useActionData,
  useSubmit,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "react-router";
import { ROUTES } from "~/utils/routes";
import * as Evolver from "client/services.gen";
import clsx from "clsx";
import { EvolverConfigWithoutDefaults } from "client";
import { BeakerIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { toast as notify } from "react-toastify";
import { useEffect } from "react";
import { WarningModal } from "~/components/Modals";
import { getEvolverClientForDevice } from "~/utils/evolverClient.server";

export const handle = {
  breadcrumb: (props: { params: { id: string; name: string } }) => {
    const { id, name } = props.params;

    return <Link to={ROUTES.device.state({ id, name })}>{name}</Link>;
  },
};

const Intent = z.enum(["start", "stop"], {
  required_error: "intent is required",
  invalid_type_error: "must be one of, start or stop",
});

const schema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal(Intent.Enum.start),
    id: z.string(),
    redirectTo: z.string(),
  }),
  z.object({
    intent: z.literal(Intent.Enum.stop),
    id: z.string(),
    redirectTo: z.string(),
  }),
]);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // prelim validation, just checks request has proper intent and an id for the device to start or stop
  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent, id, redirectTo } = submission.value;

  try {
    const { evolverClient } = await getEvolverClientForDevice(id);

    switch (intent) {
      case Intent.Enum.start:
        try {
          await Evolver.startStartPost({ client: evolverClient });
        } catch (error) {
          return submission.reply({ formErrors: ["unable to start device"] });
        }
        break;
      case Intent.Enum.stop:
        try {
          await Evolver.abortAbortPost({ client: evolverClient });
        } catch (error) {
          return submission.reply({ formErrors: ["unable to stop device"] });
        }
        break;
      default:
        return submission.reply();
    }
    return redirect(redirectTo);
  } catch (error) {
    return submission.reply({ formErrors: ["device not found"] });
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const { evolverClient, url } = await getEvolverClientForDevice(id);

  const describeEvolver = await Evolver.describe({ client: evolverClient });
  const evolverState = await Evolver.state({ client: evolverClient });

  return {
    description: describeEvolver.data as {
      config: EvolverConfigWithoutDefaults;
    },
    url,
    ok: true,
    state: evolverState.data,
  };
}

export function ErrorBoundary() {
  const { id } = useParams();
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`Error loading the device: ${id}`}</h1>
        </div>
      </div>

      <Link to={ROUTES.static.devices} className="link">
        home
      </Link>
    </div>
  );
}

export default function Device() {
  const { id, name } = useParams();
  const { description, url, state } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.error) {
      if (typeof actionData.error === "string") {
        notify.error(actionData.error);
      }
      if (typeof actionData.error === "object") {
        const errorMessages: string[] = [];
        Object.entries(actionData.error).forEach(([key, value]) => {
          errorMessages.push(`${key}: ${value}`);
        });
        errorMessages.forEach((message) => {
          notify.error(message);
        });
      }
    }
  }, [actionData]);
  const pathElements = pathname.split("/");
  const lastPathElement = pathElements[pathElements.length - 1];
  const evolverConfig = description.config;

  return (
    <div className="flex flex-col gap-4">
      <div className=" flex items-center gap-4 justify-between pb-4">
        <div className="flex items-center">
          <div className="flex flex-col gap-2">
            <h1>{`${evolverConfig.name}`}</h1>
            <div className="flex w-full">
              <h1 className="font-sans">
                <span className="font-mono">
                  <a
                    className="link"
                    href={`${url}/docs`}
                    target="_blank"
                    rel="noreferrer"
                  >{`api`}</a>
                </span>
              </h1>
              <div className="divider divider-horizontal"></div>
              <h1 className="font-sans">
                <span className="font-mono">
                  <a
                    className="link"
                    href={`${url}/html/network`}
                    target="_blank"
                    rel="noreferrer"
                  >{`network`}</a>
                </span>
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-end">
          <div className="flex flex-col items-center">
            <BeakerIcon className="h-9 w-9 text-accent" />
            <div className={clsx("badge text-sm", "badge-accent")}>online</div>
          </div>
          {state.active && (
            <div
              className="tooltip"
              data-tip="Click to stop device hardware and stop the control loop"
            >
              <WarningModal
                warningTitle="pause device"
                warningMessage="Pause the hardware and the control loop, any data stored-in-memory will be lost."
                modalId="start_device_modal"
                submitText="pause"
                submitClassname="btn btn-error"
                onClick={() => {
                  notify.dismiss();
                  const formData = new FormData();
                  formData.append("redirectTo", pathname);
                  formData.append("id", id ?? "");
                  formData.append("intent", Intent.Enum.stop);
                  submit(formData, {
                    method: "POST",
                  });
                }}
              >
                <div className="flex flex-col items-center">
                  <PauseIcon
                    title="pause device"
                    className="h-9 w-9 text-accent"
                  />
                  <div className="badge text-sm badge-accent">running</div>
                </div>
              </WarningModal>
            </div>
          )}
          {!state.active && (
            <div
              className="tooltip"
              data-tip="Click to start running the device hardware and the control loop"
            >
              <WarningModal
                warningTitle="start device"
                warningMessage="Are you sure you want to start the device?"
                modalId="start_device_modal"
                submitText="start"
                onClick={() => {
                  notify.dismiss();
                  const formData = new FormData();

                  formData.append("redirectTo", pathname);
                  formData.append("id", id ?? "");
                  formData.append("intent", Intent.Enum.start);
                  submit(formData, {
                    method: "POST",
                  });
                }}
              >
                <div className="flex flex-col items-center">
                  <PlayIcon
                    title="start device"
                    className="h-9 w-9 fill-current "
                  />

                  <div className="badge text-sm ">stopped</div>
                </div>
              </WarningModal>
            </div>
          )}
        </div>
      </div>
      <div>
        <div role="tablist" className="tabs tabs-box">
          <Link
            to={ROUTES.device.state({ id, name })}
            role="tab"
            className={clsx(
              "tab",
              lastPathElement === "state" && "tab-active",
              "tab-border-3",
            )}
          >
            state
          </Link>
          <Link
            role="tab"
            to={ROUTES.device.config({ id, name })}
            className={clsx(
              "tab",
              lastPathElement === "config" &&
                !pathElements.includes("experiments") &&
                "tab-active",
              "tab-border-3",
            )}
          >
            configuration
          </Link>
          <Link
            to={ROUTES.device.hardware.list({ id, name })}
            role="tab"
            className={clsx(
              "tab",
              pathElements.includes("hardware") && "tab-active",
              "tab-border-3",
            )}
          >
            hardware
          </Link>
          <Link
            to={ROUTES.device.experiment.list({ id, name })}
            role="tab"
            className={clsx(
              "tab",
              pathElements.includes("experiments") && "tab-active",
              "tab-border-3",
            )}
          >
            experiments
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
