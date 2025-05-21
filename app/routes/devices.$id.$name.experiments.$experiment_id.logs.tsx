import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { Link, useLoaderData, LoaderFunctionArgs } from "react-router";
import * as Evolver from "client/services.gen";
import LogTable from "~/components/LogTable";
import { getEvolverClientForDevice } from "~/utils/evolverClient.server";
import { ROUTES } from "~/utils/routes";
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

export async function loader({ params }: LoaderFunctionArgs) {
  const { id, experiment_id } = params;

  try {
    const { evolverClient } = await getEvolverClientForDevice(id);

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
  } catch (error) {
    throw new Error(
      "Failed to load experiment logs: " + (error.message || "Unknown error"),
    );
  }
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
      <div className="font-mono">logs</div>
      {LogView}
    </div>
  );
}
