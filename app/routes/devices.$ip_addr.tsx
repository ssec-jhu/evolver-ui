import {
  Outlet,
  Link,
  useParams,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { z } from "zod";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";
import clsx from "clsx";
import { EvolverConfigWithoutDefaults } from "client";
import { BeakerIcon } from "@heroicons/react/24/outline";
import { ENV } from "~/utils/env.server";

export const handle = {
  breadcrumb: ({ params }: { params: { ip_addr: string } }) => {
    const { ip_addr } = params;
    return <Link to={`/devices/${ip_addr}/state`}>{ip_addr}</Link>;
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { ip_addr } = params;
  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${ENV.DEFAULT_DEVICE_PORT}`,
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
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-4 mb-8 justify-between">
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
      <Link to="/" className="link">
        home
      </Link>
    </div>
  );
}

export default function Device() {
  const { ip_addr } = useParams();
  const { description } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const currentPath = pathname.split("/").pop();
  const evolverConfig = description.config;

  return (
    <div className="flex flex-col gap-8">
      <div className=" flex items-center gap-4 justify-between">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl">{`${evolverConfig.name}`}</h1>
            <div>
              <h1 className="font-mono">{`${ip_addr}`}</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <BeakerIcon className="h-9 w-9 text-accent" />
          <div className={clsx("badge text-sm", "badge-accent")}>online</div>
        </div>
      </div>
      <div role="tablist" className="tabs tabs-lg tabs-boxed">
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
            "tab-border-3",
          )}
        >
          hardware
        </Link>

        <Link
          to={"./controllers"}
          role="tab"
          className={clsx(
            "tab",
            currentPath === "controllers" && "tab-active",
            "tab-border-3",
          )}
        >
          controllers
        </Link>
      </div>
      <div className="p-8 bg-base-300 rounded-box  relative overflow-x-auto">
        <Outlet />
      </div>
    </div>
  );
}
