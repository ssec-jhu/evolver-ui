import {
  Outlet,
  Link,
  useParams,
  useLoaderData,
  useSearchParams,
  useLocation,
} from "@remix-run/react";
import { z } from "zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";
import clsx from "clsx";
import { parseWithZod } from "@conform-to/zod";
import { EvolverConfigWithoutDefaults } from "client";
import { BeakerIcon } from "@heroicons/react/24/outline";

export const UpdateDeviceIntentEnum = z.enum(["update_evolver"], {
  required_error: "an intent is required",
  invalid_type_error: "must be one of, update_device",
});

export const handle = {
  breadcrumb: ({ params }: { params: { ip_addr: string } }) => {
    const { ip_addr } = params;
    return <Link to={`/devices/${ip_addr}/state`}>{ip_addr}</Link>;
  },
};

const schema = z.object({
  intent: UpdateDeviceIntentEnum,
  // The preprocess step is required for zod to perform the required check properly
  // as the value of an empty input is usually an empty string
  ip_addr: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ required_error: "an ip address is required" }),
  ),
  // Assume this is valid, client side AJV validation.
  data: z.string({ required_error: "an evolver config is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: schema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent, ip_addr, data } = submission.value;

  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${process.env.DEFAULT_DEVICE_PORT}`,
  });

  switch (intent) {
    case UpdateDeviceIntentEnum.Enum.update_evolver:
      try {
        const { response } = await Evolver.update({
          body: JSON.parse(data),
          client: evolverClient,
        });
        if (response.status !== 200) {
          throw new Error();
        }
        return redirect(`/devices/${ip_addr}`);
      } catch (error) {
        return json({ error: "unable to update device" }, { status: 500 });
      }
    default:
      return null;
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { ip_addr } = params;
  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${process.env.DEFAULT_DEVICE_PORT}`,
  });
  const describeEvolver = await Evolver.describe({ client: evolverClient });
  const rootClassSchema = await Evolver.getSchemaSchemaGet({
    query: { classinfo: "evolver.device.Evolver" },
    client: evolverClient,
  });
  return json({
    description: describeEvolver.data as {
      config: EvolverConfigWithoutDefaults;
    },
    schema: rootClassSchema.data,
    ok: true,
  });
}

export function ErrorBoundary() {
  const { ip_addr } = useParams();

  return (
    <div className="mx-auto max-w-6xl px-4 ">
      <div className="mt-4 flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div>
              <h1 className="font-mono">{`${ip_addr}`}</h1>
            </div>
          </div>
          <div className={clsx("badge text-sm", "badge-ghost badge-outline")}>
            offline
          </div>
        </div>
      </div>
      <Link to="/devices" className="link">
        other devices
      </Link>
    </div>
  );
}

export default function Device() {
  const { ip_addr, hardware_name } = useParams();
  const { description } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const currentPath = pathname.split("/").pop();
  console.log(currentPath);
  const classinfo = searchParams.get("classinfo");
  const hardwareClass = classinfo?.split(".").pop();
  const evolverConfig = description.config;
  return (
    <div>
      <div className="mt-4 flex items-center gap-4 justify-between">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl">{`${evolverConfig.name}`}</h1>
            <div>
              <h1 className="font-mono">{`${ip_addr}`}</h1>
            </div>
          </div>
        </div>
        {/**TODO: this title attribute should probably be in the handle */}
        {currentPath === "history" && (
          <div className="flex flex-wrap">
            <div className="text-xl">
              <div>{`${hardware_name}`}</div>
            </div>
            <div className="divider divider-horizontal"></div>
            <div className="text-xl">
              <div>{hardwareClass}</div>
            </div>
          </div>
        )}

        {currentPath === "config" && (
          <div className="flex">
            <div className="text-xl">
              <div>Config</div>
            </div>
          </div>
        )}

        {currentPath === "hardware" && (
          <div className="flex">
            <div className="text-xl">
              <div>Hardware</div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center">
          <BeakerIcon className="h-9 w-9 text-accent" />
          <div className={clsx("badge text-sm", "badge-accent")}>online</div>
        </div>
      </div>
      <div role="tablist" className="mt-8 mb-8 tabs tabs-bordered">
        <Link
          to={"./state"}
          role="tab"
          className={clsx("tab", currentPath === "state" && "tab-active")}
        >
          State
        </Link>
        <Link
          role="tab"
          to={"./config"}
          className={clsx("tab", currentPath === "config" && "tab-active")}
        >
          Config
        </Link>
        <Link
          to={"./hardware"}
          role="tab"
          className={clsx(
            "tab",
            currentPath === "hardware" && "tab-active",
            currentPath === "history" && "tab-active",
          )}
        >
          Hardware
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
