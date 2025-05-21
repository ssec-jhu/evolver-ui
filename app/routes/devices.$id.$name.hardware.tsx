import { Link, Outlet, useLoaderData, useParams } from "react-router";
import { ROUTES } from "~/utils/routes";
import type { Route } from "./+types/devices.$id.$name.hardware";
import { HardwareTable } from "~/components/HardwareTable";
import * as Evolver from "client/services.gen";
import { CogIcon } from "@heroicons/react/24/outline";
import { deviceInfo } from "~/cookies.server";
import { createEvolverClient } from "~/utils/evolverClient.client";
import type { EvolverConfigWithoutDefaults } from "client";
import { DefaultHydrateFallback } from "~/components/HydrateFallback";
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; hardware_name: string; name: string };
  }) => {
    const { id, name } = params;
    return <Link to={ROUTES.device.hardware.list({ id, name })}>hardware</Link>;
  },
};

export async function loader({ request }: Route.LoaderArgs) {
  return {
    device: await deviceInfo.parse(request.headers.get("Cookie")),
  };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const { device } = await serverLoader();
  const { url } = device;
  const evolverClient = createEvolverClient(url);
  const [describeEvolver] = await Promise.all([
    Evolver.describe({ client: evolverClient }),
  ]);
  return {
    description: describeEvolver.data as {
      config: EvolverConfigWithoutDefaults;
    },
    ok: true,
  };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <DefaultErrorBoundary
      error={error}
      title="Error loading hardware"
      subtitle="Unable to load hardware information. Please ensure the device is online and try again."
    />
  );
}

export default function Hardware() {
  const { id, hardware_name, name } = useParams<Route.LoaderArgs["params"]>();
  const {
    description: { config: evolverConfig },
  } = useLoaderData<typeof clientLoader>();

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
            to={ROUTES.device.config({ id: id ?? "", name: name ?? "" })}
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
