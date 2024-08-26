import { Link, Outlet, useParams, useRouteLoaderData } from "@remix-run/react";

import { HardwareTable } from "~/components/HardwareTable";
import { loader } from "./devices.$id";
import { EvolverConfigWithoutDefaults } from "client";
import { CogIcon } from "@heroicons/react/24/outline";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; hardware_name: string };
  }) => {
    const { id } = params;
    return <Link to={`/devices/${id}/hardware`}>hardware</Link>;
  },
};

export default function Hardware() {
  const { id } = useParams();
  // TODO: figure this out, should submit to nearest layout route with a loader
  const loaderData = useRouteLoaderData<typeof loader>("routes/devices.$id");
  let evolverConfig = {} as EvolverConfigWithoutDefaults;

  if (loaderData?.description?.config) {
    const description = loaderData.description;
    if (description && description.config) {
      evolverConfig = description.config as EvolverConfigWithoutDefaults;
    }
  }

  if (
    !evolverConfig.hardware ||
    Object.keys(evolverConfig.hardware).length === 0
  ) {
    return (
      <div className="flex flex-col items-center">
        <CogIcon className="h-20 w-20" />
        <div>No hardware associated with this device.</div>
        <div
          className="tooltip"
          data-tip="use the configuration editor to add hardware "
        >
          <Link className="link text-primary" to={`/devices/${id}/config`}>
            add hardware
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