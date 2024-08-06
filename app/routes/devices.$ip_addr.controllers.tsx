import { Link, Outlet, useParams, useRouteLoaderData } from "@remix-run/react";
import { HardwareTable } from "~/components/HardwareTable";
import { loader } from "./devices.$ip_addr";
import { EvolverConfigWithoutDefaults } from "client";
import { CogIcon } from "@heroicons/react/24/outline";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { ip_addr: string; hardware_name: string };
  }) => {
    const { ip_addr } = params;
    return <Link to={`/devices/${ip_addr}/hardware`}>hardware</Link>;
  },
};

export default function Controllers() {
  const { ip_addr } = useParams();
  // TODO: figure this out, should submit to nearest layout route with a loader
  const loaderData = useRouteLoaderData<typeof loader>(
    "routes/devices.$ip_addr",
  );
  let evolverConfig = {} as EvolverConfigWithoutDefaults;

  if (loaderData?.description?.config && loaderData?.schema?.config) {
    const description = loaderData.description;
    if (description && description.config) {
      evolverConfig = description.config as EvolverConfigWithoutDefaults;
    }
  }

  if (!evolverConfig.controllers || evolverConfig.controllers.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <CogIcon className="h-20 w-20" />
        <div>No controllers associated with this device.</div>
        <div
          className="tooltip"
          data-tip="use the configuration editor to add hardware "
        >
          <Link className="link text-primary" to={`/devices/${ip_addr}/config`}>
            add controller
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HardwareTable evolverConfig={evolverConfig} />
      <Outlet />
    </div>
  );
}
