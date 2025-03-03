import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { EvolverConfigWithoutDefaults } from "client";
import { CogIcon } from "@heroicons/react/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";

import * as Evolver from "client/services.gen";

import { createClient } from "@hey-api/client-fetch";
import { ControllerConfig } from "~/components/ControllerConfig";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string } }) => {
    const { id } = params;
    return <Link to={`/devices/${id}/experiment`}>experiment</Link>;
  },
};

export function ErrorBoundary() {
  const { id, experiment_id } = useParams();
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`Error loading experiment ${experiment_id}. Check config experiments attribute.`}</h1>
        </div>
      </div>

      <Link to={`/devices/${id}/config`} className="link">
        config
      </Link>
    </div>
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

  const results = Promise.allSettled([
    Evolver.getExperimentsExperimentGet({
      client: evolverClient,
    }),
  ]).then((results) => {
    return results.map((result) => result.value.data);
  });

  const [experiments] = await results;

  return { experiments };
}

export default function Controllers() {
  const { id, experiment_id } = useParams();
  const { experiments } = useLoaderData<typeof loader>();

  const loaderData = useRouteLoaderData<typeof loader>("routes/devices.$id");
  let evolverConfig = {} as EvolverConfigWithoutDefaults;

  if (loaderData?.description?.config) {
    const description = loaderData.description;
    if (description && description.config) {
      evolverConfig = description.config as EvolverConfigWithoutDefaults;
    }
  }

  if (!evolverConfig.experiments[experiment_id]) {
    return (
      <div className="flex flex-col items-center">
        <CogIcon className="h-20 w-20" />
        <div>{`No experiment with name: ${experiment_id} was found in config.`}</div>
        <div
          className="tooltip"
          data-tip="use the configuration editor to add hardware "
        >
          <Link className="link text-primary" to={`/devices/${id}/config`}>
            add experiment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      {Object.entries(experiments)
        .filter(([experimentId]) => {
          experimentId !== experiment_id;
        })
        .map(([experimentId, experimentData]) => (
          <div key={experimentId} className="mt-8">
            <h2 className="text-lg font-bold mb-4">
              {experimentData.name || experimentId} Controllers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experimentData.controllers &&
                experimentData.controllers.map((controller, idx) => (
                  <ControllerConfig
                    key={`${experimentId}-controller-${idx}`}
                    controller={controller}
                  />
                ))}
            </div>
          </div>
        ))}
      <Outlet />
    </div>
  );
}
