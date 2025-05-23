import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useRouteLoaderData,
  LoaderFunctionArgs,
} from "react-router";
import { ROUTES } from "~/utils/routes";
import { EvolverConfigWithoutDefaults } from "client";
import { CogIcon } from "@heroicons/react/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import * as Evolver from "client/services.gen";
import { ExperimentsTable } from "~/components/ExperimentsTable";
import { getEvolverClientForDevice } from "~/utils/evolverClient.server";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return (
      <Link to={ROUTES.device.experiment.list({ id, name })}>experiments</Link>
    );
  },
};

export function ErrorBoundary() {
  const { id, name } = useParams();
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`Error loading experiment. Check config experiments attribute.`}</h1>
        </div>
      </div>

      <Link to={ROUTES.device.config({ id, name })} className="link">
        config
      </Link>
    </div>
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  try {
    const { evolverClient } = await getEvolverClientForDevice(id);

    const results = Promise.allSettled([
      Evolver.getExperimentsExperimentGet({
        client: evolverClient,
      }),
    ]).then((results) => {
      return results.map((result) => result.value.data);
    });

    const [experiments] = await results;

    return { experiments };
  } catch (error) {
    throw new Error(
      "Failed to load experiments: " + (error.message || "Unknown error"),
    );
  }
}

export default function Controllers() {
  const { id, name } = useParams();
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

  if (!evolverConfig.experiments) {
    return (
      <div className="flex flex-col items-center">
        <CogIcon className="h-20 w-20" />
        <div>No experiments found in config.</div>
        <div
          className="tooltip"
          data-tip="use the configuration editor to add hardware "
        >
          <Link
            className="link text-primary"
            to={ROUTES.device.config({ id, name })}
          >
            add experiment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
        <ExperimentsTable
          evolverConfig={evolverConfig}
          experiments={experiments}
        />
      </div>
      <Outlet />
    </div>
  );
}
