import {
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

// TODO: don't do this, i think the evolver config has layout dims.
const VIAL_COUNT = 16;

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return <Link to={ROUTES.device.state({ id, name })}>state</Link>;
  },
};

export async function loader({ request }: Route.LoaderArgs) {
  return {
    device: await deviceInfo.parse(request.headers.get("Cookie")), // (1) loader returns the deviceInfo cookie, NOTE: this must be parsed by a loader because the cookie is server-side only pattern.
  };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const {
    device: { url },
  } = await serverLoader();

  const evolverClient = createEvolverClient(url); //(2) create a client using the device URL returned by the serverLoader().
  // TODO Promise all.
  const { data } = await Evolver.state({ client: evolverClient });
  const describeEvolver = await Evolver.describe({ client: evolverClient });
  const vials = describeEvolver?.data?.config?.vials;
  return {
    vials: vials,
    evolverState: data,
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
