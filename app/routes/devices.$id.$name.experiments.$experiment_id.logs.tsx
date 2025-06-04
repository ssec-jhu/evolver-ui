import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/devices.$id.$name.experiments.$experiment_id.logs";
import * as Evolver from "client/services.gen";
import LogTable, { type LogLine } from "~/components/LogTable";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { ROUTES } from "~/utils/routes";
import { DefaultHydrateFallback } from "~/components/HydrateFallback";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; experiment_id: string; name: string };
  }) => {
    const { id, experiment_id, name } = params;
    return (
      <Link
        to={ROUTES.device.experiment.logs({
          id,
          name,
          experimentId: experiment_id,
        })}
      >
        logs
      </Link>
    );
  },
};

export async function loader({ request }: Route.LoaderArgs) {
  return {
    device: await deviceInfo.parse(request.headers.get("Cookie")),
  };
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const { device } = await serverLoader();
  const { experiment_id } = params;
  const evolverClient = createEvolverClient(device.url);

  const [{ data }] = await Promise.all([
    Evolver.getExperimentLogsExperimentExperimentNameLogsGet({
      client: evolverClient,
      path: { experiment_name: experiment_id },
    }),
  ]);
  return { logs: (data as { data: object }).data as Record<string, LogLine[]> };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
}

export function ErrorBoundary() {
  return (
    <div>
      <div className="divider"></div>
      <div className="font-mono">logs</div>
      <div className="divider"></div>

      <div className="flex flex-col gap-4 bg-base-300 rounded-box">
        <WrenchScrewdriverIcon className="w-10 h-10" />
        <div>
          <div>
            <h1 className="font-mono">{`There was an error fetching logs.`}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExperimentLogs() {
  const { logs } = useLoaderData<typeof clientLoader>();
  const LogTables = Object.keys(logs).map((key, ix) => (
    <LogTable key={key + ix} title={key} logs={logs[key]} />
  ));
  console.log("logs on comp", logs);
  console.log("LogTables", Object.keys(logs).length, LogTables);
  const LogView =
    Object.keys(logs).length > 0 ? (
      LogTables
    ) : (
      <div className="flex flex-col items-center justify-center p-4 bg-base-300 rounded-box relative overflow-x-auto">
        <div className="card bg-base-100  shadow-xl">
          <div className="card-body">
            <p>No log data yet</p>
          </div>
        </div>
      </div>
    );
  return (
    <div id={"logs"}>
      <div className="font-mono">logs</div>
      {LogView}
    </div>
  );
}
