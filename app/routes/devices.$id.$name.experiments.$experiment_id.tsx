import { Link, Outlet, useParams, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/devices.$id.$name.experiments.$experiment_id";
import type { EvolverConfigWithoutDefaults } from "client";
import { CogIcon } from "@heroicons/react/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";

import * as Evolver from "client/services.gen";
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
        to={ROUTES.device.experiment.current({
          id,
          name,
          experimentId: experiment_id,
        })}
      >
        {experiment_id}
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

      {id && name && (
        <Link to={ROUTES.device.config({ id, name })} className="link">
          config
        </Link>
      )}
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  return {
    device: await deviceInfo.parse(request.headers.get("Cookie")),
  };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const { device } = await serverLoader();

  const evolverClient = createEvolverClient(device.url);

  const [experiments] = await Promise.all([
    Evolver.getExperimentsExperimentGet({
      client: evolverClient,
    }),
  ]);

  return { experiments: experiments.data };
}

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
}

export default function Controllers() {
  const { id, experiment_id, name } = useParams<Route.ActionArgs["params"]>();

  const loaderData = useRouteLoaderData("routes/devices.$id.$name");
  let evolverConfig = {} as EvolverConfigWithoutDefaults;

  if (loaderData?.description?.config) {
    const description = loaderData.description;
    if (description && description.config) {
      evolverConfig = description.config as EvolverConfigWithoutDefaults;
    }
  }

  if (experiment_id && !evolverConfig.experiments[experiment_id]) {
    return (
      <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box items-center">
        <CogIcon className="h-20 w-20" />
        <div>{`No experiment with name: ${experiment_id} was found in config.`}</div>
        <div
          className="tooltip"
          data-tip="use the configuration editor to add hardware "
        >
          {id && name && (
            <Link
              className="link text-primary"
              to={ROUTES.device.config({ id, name })}
            >
              add experiment
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      <Outlet />
    </div>
  );
}
