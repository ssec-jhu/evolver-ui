import {
  Outlet,
  Link,
  useParams,
  useLoaderData,
  useLocation,
  useActionData,
  useSubmit,
} from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";
import clsx from "clsx";
import { EvolverConfigWithoutDefaults } from "client";
import { BeakerIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { db } from "~/utils/db.server";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { toast as notify } from "react-toastify";
import { useEffect } from "react";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string } }) => {
    const { id } = params;
    return <Link to={`/devices/${id}/state`}>{id}</Link>;
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

  // use the db to get the url for that device id...
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  if (!targetDevice) {
    return submission.reply({ formErrors: ["device not found"] });
  }

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

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
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });
  if (!targetDevice) {
    throw Error("device not found");
  }
  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });
  const describeEvolver = await Evolver.describe({ client: evolverClient });
  const evolverState = await Evolver.state({ client: evolverClient });

  return json({
    description: describeEvolver.data as {
      config: EvolverConfigWithoutDefaults;
    },
    url,
    ok: true,
    state: evolverState.data,
  });
}

export function ErrorBoundary() {
  const { id } = useParams();
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-8 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`Error loading the device: ${id}`}</h1>
        </div>
      </div>

      <Link to="/devices" className="link">
        home
      </Link>
    </div>
  );
}

export default function Device() {
  const { id } = useParams();
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
  const currentPath = pathname.split("/").pop();
  const evolverConfig = description.config;

  return (
    <div className="flex flex-col gap-4">
      <div className=" flex items-center gap-4 justify-between">
        <div className="flex items-center">
          <div>
            <h1>{`${evolverConfig.name}`}</h1>
            <div className="flex w-full">
              <h1 className="font-mono">{`${id}`}</h1>
              <div className="divider divider-horizontal"></div>
              <h1 className="font-sans">
                <span className="font-mono">
                  <a
                    className="link"
                    href={`${url}/docs`}
                    target="_blank"
                    rel="noreferrer"
                  >{`${url}/docs`}</a>
                </span>
              </h1>
            </div>
          </div>
        </div>
        <div className=" flex items-center gap-4 justify-end">
          <div className="flex flex-col items-center">
            <BeakerIcon className="h-9 w-9 text-accent" />
            <div className={clsx("badge text-sm", "badge-accent")}>online</div>
          </div>
          {state.active && (
            <div
              className="tooltip"
              data-tip="Click to stop device hardware and stop the control loop"
            >
              <div className="flex flex-col items-center">
                <PauseIcon
                  title="pause device"
                  className="h-9 w-9 text-accent"
                  onClick={() => {
                    notify.dismiss();
                    const formData = new FormData();
                    formData.append("redirectTo", pathname);
                    console.log("FORM DAata", formData);
                    formData.append("id", id ?? "");
                    formData.append("intent", Intent.Enum.stop);
                    submit(formData, {
                      method: "POST",
                    });
                  }}
                />
                <div className="badge text-sm badge-accent">running</div>
              </div>
            </div>
          )}
          {!state.active && (
            <div
              className="tooltip"
              data-tip="Click to start running the device hardware and the control loop"
            >
              <div className="flex flex-col items-center">
                <PlayIcon
                  title="start device"
                  className="h-9 w-9 fill-current "
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
                />
                <div className="badge text-sm badge-current">stopped</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div role="tablist" className="tabs  tabs-boxed">
        <Link
          to={"./state"}
          role="tab"
          className={clsx(
            "tab",
            currentPath === "state" && "tab-active",
            "tab-border-3",
          )}
        >
          state
        </Link>
        <Link
          role="tab"
          to={"./config"}
          className={clsx(
            "tab",
            currentPath === "config" && "tab-active",
            "tab-border-3",
          )}
        >
          configuration
        </Link>
        <Link
          to={"./hardware"}
          role="tab"
          className={clsx(
            "tab",
            currentPath === "hardware" && "tab-active",
            currentPath === "history" && "tab-active",
            currentPath === "calibrate" && "tab-active",
            "tab-border-3",
          )}
        >
          hardware
        </Link>
      </div>
      <div className="p-8 bg-base-300 rounded-box  relative overflow-x-auto">
        <Outlet />
      </div>
    </div>
  );
}
