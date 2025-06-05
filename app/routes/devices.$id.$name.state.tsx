import {
  data,
  Link,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "react-router";
import * as Evolver from "client/services.gen";
import { FilterableVialGrid } from "~/components/VialGrid";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { ROUTES } from "~/utils/routes";
import type { Route } from "./+types/devices.$id.$name.state";
import { DefaultHydrateFallback } from "~/components/HydrateFallback";
import { getDeviceById } from "~/utils/evolverClient.server";

// TODO: don't do this, i think the evolver config has layout dims.
const VIAL_COUNT = 16;

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return <Link to={ROUTES.device.state({ id, name })}>state</Link>;
  },
};

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;
  const device = await getDeviceById(id);
  return data(
    { device },
    {
      headers: {
        "Set-Cookie": await deviceInfo.serialize(device),
      },
    },
  );
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const {
    device: { url },
  } = await serverLoader();

  const evolverClient = createEvolverClient(url);

  const [describeEvolver, evolverState] = await Promise.all([
    Evolver.describe({ client: evolverClient }),
    Evolver.state({ client: evolverClient }),
  ]);

  return {
    vials: describeEvolver?.data?.config?.vials,
    evolverState: evolverState.data,
  };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
}

export default function Hardware() {
  const { id } = useParams<Route.LoaderArgs["params"]>();
  const { evolverState } = useLoaderData<typeof clientLoader>();

  const {
    ENV: { EXCLUDED_PROPERTIES },
  } = useRouteLoaderData("root");

  const excludedProperties = EXCLUDED_PROPERTIES?.split(",") ?? [];

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      <FilterableVialGrid
        stateData={evolverState?.state ?? {}}
        id={id ?? ""}
        vialCount={VIAL_COUNT}
        excludedProperties={excludedProperties}
      />
    </div>
  );
}
