import {
  Link,
  Outlet,
  useParams,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react";
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
    return <Link to={`/devices/${id}/controllers`}>controllers</Link>;
  },
};

export default function Controllers() {
  const { id, hardware_name } = useParams();

  const [queryParams] = useSearchParams();
  const loaderData = useRouteLoaderData<typeof loader>("routes/devices.$id");
  let evolverConfig = {} as EvolverConfigWithoutDefaults;

  if (loaderData?.description?.config) {
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
          <Link className="link text-primary" to={`/devices/${id}/config`}>
            add controller
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HardwareTable
        evolverConfig={evolverConfig}
        id={id ?? ""}
        queryParams={queryParams}
        hardwareName={hardware_name ?? ""}
      />
      <Outlet />
    </div>
  );
}
