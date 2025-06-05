import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/devices.$id.$name.experiments";
import { ROUTES } from "~/utils/routes";
import type { EvolverConfigWithoutDefaults } from "client";
import { CogIcon } from "@heroicons/react/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import * as Evolver from "client/services.gen";
import { ExperimentsTable } from "~/components/ExperimentsTable";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { DefaultHydrateFallback } from "~/components/HydrateFallback";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return (
      <Link to={ROUTES.device.experiment.list({ id, name })}>experiments</Link>
    );
  },
};

export function ErrorBoundary() {
  const { id, name } = useParams<Route.ActionArgs["params"]>();
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`error loading experiment - check`}</h1>
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

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
}

export default function Controllers() {
  const { id, name } = useParams<Route.ActionArgs["params"]>();
  const { pathname } = useLocation();
  const { experiments } = useLoaderData<typeof clientLoader>();

  const loaderData = useRouteLoaderData("routes/devices.$id.$name");
  let evolverConfig = {} as EvolverConfigWithoutDefaults;

  if (loaderData?.description?.config) {
    const description = loaderData.description;
    if (description && description.config) {
      evolverConfig = description.config as EvolverConfigWithoutDefaults;
    }
  }

  if (!evolverConfig.experiments) {
    return (
      <div className="flex flex-col items-center">
        <CogIcon className="h-20 w-20" />
        <div>No experiments found in config.</div>
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
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
        {name && id && (
          <ExperimentsTable
            experiments={experiments ?? {}}
            name={name}
            id={id}
            pathname={pathname}
          />
        )}
      </div>
      <Outlet />
    </div>
  );
}
