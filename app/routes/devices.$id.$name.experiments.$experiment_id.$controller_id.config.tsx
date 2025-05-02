import {
  Link,
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
  breadcrumb: ({
    params,
  }: {
    params: {
      id: string;
      experiment_id: string;
      name: string;
      controller_id: string;
    };
  }) => {
    const { id, experiment_id, name, controller_id } = params;
    return (
      <Link
        to={`/devices/${id}/${name}/experiments/${experiment_id}/${controller_id}/config`}
      >
        {controller_id}
      </Link>
    );
  },
};

export function ErrorBoundary() {
  const { id, experiment_id, name } = useParams();
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`Error loading experiment ${experiment_id}. Check config experiments attribute.`}</h1>
        </div>
      </div>

      <Link to={`/devices/${id}/${name}/config`} className="link">
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
  const { id, experiment_id, controller_id } = useParams();
  const { experiments } = useLoaderData<typeof loader>();

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

  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono">{`${experiment_id} > ${controller_id} > config`}</div>
      <div className="bg-base-300 rounded-box relative overflow-x-auto">
        {Object.entries(experiments)
          .filter(([experimentId]) => experimentId == experiment_id)
          .map(([experimentId, experimentData]) => (
            <div key={experimentId}>
              {experimentData.controllers &&
                experimentData.controllers
                  .filter(
                    (controller) => controller.config.name == controller_id,
                  )
                  .map((controller, idx) => (
                    <div key={`${experimentId}-controller-${idx}`}>
                      <ControllerConfig controller={controller} />
                    </div>
                  ))}
            </div>
          ))}
      </div>
    </div>
  );
}
