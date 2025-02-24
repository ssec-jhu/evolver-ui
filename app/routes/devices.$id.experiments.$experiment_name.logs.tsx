import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { createClient } from "@hey-api/client-fetch";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

import * as Evolver from "client/services.gen";
import { LoaderFunctionArgs } from "@remix-run/node";
import LogDisplay, { LogLine } from "~/components/LogDisplay";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id, experiment_name } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });
  const { url } = targetDevice ?? { url: "" };
  const evolverClient = createClient({
    baseUrl: url,
  });

  const results = Promise.allSettled([
    Evolver.getExperimentLogsExperimentExperimentNameLogsGet({
      client: evolverClient,
      path: { experiment_name },
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
  console.log("DATA: ", logs);
  const l = Object.keys(logs).map((key, ix) => (
    <LogDisplay key={`${key}-${ix}`} title={key} logs={logs[key]} />
  ));
  return (
    <div>
      <div className="divider"></div>
      <div className="font-mono">logs</div>
      {l}
    </div>
  );
}
