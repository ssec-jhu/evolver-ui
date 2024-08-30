import {
  Outlet,
  Link,
  useParams,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";
import clsx from "clsx";
import { EvolverConfigWithoutDefaults } from "client";
import { BeakerIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { db } from "~/utils/db.server";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string } }) => {
    const { id } = params;
    return <Link to={`/devices/${id}/state`}>{id}</Link>;
  },
};

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
  return json({
    description: describeEvolver.data as {
      config: EvolverConfigWithoutDefaults;
    },
    url,
    ok: true,
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

      <Link to="/" className="link">
        home
      </Link>
    </div>
  );
}

export default function Device() {
  const { id } = useParams();
  const { description, url } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const currentPath = pathname.split("/").pop();
  const evolverConfig = description.config;

  return (
    <div className="flex flex-col gap-8">
      <div className=" flex items-center gap-4 justify-between">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl">{`${evolverConfig.name}`}</h1>
            <div className="flex w-full">
              <h1 className="font-mono">{`${id}`}</h1>
              <div className="divider divider-horizontal"></div>
              <h1 className="font-mono">{`${url}`}</h1>
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
