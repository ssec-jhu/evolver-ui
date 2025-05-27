import {
  Outlet,
  Link,
  useParams,
  useLoaderData,
  useLocation,
  useActionData,
  useSubmit,
  redirect,
  data,
} from "react-router";
import { ROUTES } from "~/utils/routes";
import * as Evolver from "client/services.gen";
import clsx from "clsx";
import type { EvolverConfigWithoutDefaults } from "client";
import { BeakerIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { WarningModal } from "~/components/Modals";
import { DefaultHydrateFallback } from "~/components/HydrateFallback";
import { getDeviceById } from "~/utils/evolverClient.server";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "../cookies.server";
import { useFormErrorNotifications } from "~/utils/useFormErrorNotifications";
import type { Route } from "./+types/devices.$id.$name";
import { toast as notify } from "react-toastify";

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

const baseActionSchema = z.object({
  redirectTo: z.string(),
  device_url: z.string().url({
    message: "Device URL is required and must be a valid URL",
  }),
});

const schema = z.discriminatedUnion("intent", [
  baseActionSchema.extend({
    intent: z.literal(Intent.Enum.start),
  }),
  baseActionSchema.extend({
    intent: z.literal(Intent.Enum.stop),
  }),
]);

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  // Prelim validation
  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    return { ...submission.reply(), success: false };
  }
  const { intent, device_url: url, redirectTo } = submission.value;
  const evolverClient = createEvolverClient(url);

  try {
    switch (intent) {
      case Intent.Enum.start:
        try {
          await Evolver.startStartPost({ client: evolverClient });
        } catch (error) {
          console.log("ERROR STARTING DEVICE", error);
          return {
            ...submission.reply({ formErrors: ["unable to start device"] }),
            success: false,
          };
        }
        break;
      case Intent.Enum.stop:
        try {
          await Evolver.abortAbortPost({ client: evolverClient });
        } catch (error) {
          console.log("ERROR STOPPING DEVICE", error);
          return {
            ...submission.reply({ formErrors: ["unable to stop device"] }),
            success: false,
          };
        }
        break;
      default:
        return { ...submission.reply(), success: false };
    }
    return redirect(redirectTo);
  } catch (error) {
    return {
      ...submission.reply({ formErrors: ["device not found"] }),
      success: false,
    };
  }
}

// Server loader gets device from remote database and sets cookie.
export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Device ID is required", { status: 400 });
  }
  const device = await getDeviceById(id);

  // TODO: because getDeviceById connects to the hosted db, it can only be
  // called by a loader. similarly only loaders can use deviceInfo to get cookies and set them.
  // anything depending on this loader, and deviceInfo cookie access, fundamentally
  // still relies on an internet connection to access the hosted db.
  // We should consider a flag the user can set to switch to a local db connection. in that case
  // clientLoaders would call getDeviceFromBrowserStorage instead of serverLoader() (see below).
  // with this proposed change, the cookie would be redundant.

  return data(
    { device },
    {
      headers: {
        // Store device info in cookie so that it's available to other child-routes.
        // When the user navigates to a different device, the cookie will be updated.
        "Set-Cookie": await deviceInfo.serialize(device),
      },
    },
  );
}

// Client loader fetches Evolver data.
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  // Get device info from server (which also sets the cookie)
  const { device } = await serverLoader();

  const evolverClient = createEvolverClient(device.url);

  const [describeEvolver, evolverState] = await Promise.all([
    Evolver.describe({ client: evolverClient }),
    Evolver.state({ client: evolverClient }),
  ]);

  return {
    device,
    description: describeEvolver.data as {
      config: EvolverConfigWithoutDefaults;
    },
    ok: true,
    state: evolverState.data,
  };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
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
  if (!id || !name) {
    throw new Response("Device ID and name are required", { status: 400 });
  }
  const { description, state, device } = useLoaderData<typeof clientLoader>();
  const { url } = device;
  const { pathname } = useLocation();
  const actionData = useActionData<typeof clientAction>();
  const submit = useSubmit();

  useFormErrorNotifications(actionData);
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
          {state?.active && (
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
                  formData.append("device_url", url);
                  formData.append("redirectTo", pathname);
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
          {!state?.active && (
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
                  formData.append("device_url", url);
                  formData.append("redirectTo", pathname);
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
