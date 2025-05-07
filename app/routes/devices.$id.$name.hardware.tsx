import { Link, Outlet, useParams, useRouteLoaderData } from "react-router";

import { HardwareTable } from "~/components/HardwareTable";
import { loader } from "./devices.$id.$name";
import { EvolverConfigWithoutDefaults } from "client";
import { CogIcon } from "@heroicons/react/24/outline";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; hardware_name: string; name: string };
  }) => {
    const { id, name } = params;
    return <Link to={`/devices/${id}/${name}/hardware`}>hardware</Link>;
  },
};

export default function Hardware() {
  const { id, hardware_name, name } = useParams();
  const loaderData = useRouteLoaderData<typeof loader>(
    "routes/devices.$id.$name",
  );
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
          <Link
            className="link text-primary"
            to={`/devices/${id}/${name}/config`}
          >
            add hardware
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
        <HardwareTable
          evolverConfig={evolverConfig}
          hardwareName={hardware_name ?? ""}
        />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
