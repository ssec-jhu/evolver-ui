import { WrenchScrewdriverIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { createClient } from "@hey-api/client-fetch";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

import * as Evolver from "client/services.gen";
import { LoaderFunctionArgs } from "@remix-run/node";
import LogTable from "~/components/LogTable";
export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; experiment_id: string; name: string };
  }) => {
    const { id, experiment_id, name } = params;
    return (
      <Link to={`/devices/${id}/${name}/experiments/${experiment_id}/logs`}>
        logs
      </Link>
    );
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id, experiment_id } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });
  const { url } = targetDevice ?? { url: "" };
  const evolverClient = createClient({
    baseUrl: url,
  });

  const results = Promise.allSettled([
    Evolver.getExperimentLogsExperimentExperimentNameLogsGet({
      client: evolverClient,
      path: { experiment_name: experiment_id },
    }),
  ]).then((results) => {
    return results.map((result) => result.value.data);
  });

  const [logs] = await results;
  return { logs: logs.data };
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
  const { logs } = useLoaderData<typeof loader>();
  console.log(logs);
  const LogTables = Object.keys(logs).map((key, ix) => (
    <LogTable key={key + ix} title={key} logs={logs[key]} />
  ));
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
      <div className="divider"></div>
      <div className="font-mono">logs</div>
      <div className="divider"></div>
      {LogView}
    </div>
  );
}
