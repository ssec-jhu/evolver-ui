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

// TODO: don't do this, i think the evolver config has layout dims.
const VIAL_COUNT = 16;

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return <Link to={ROUTES.device.state({ id, name })}>state</Link>;
  },
};

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const deviceData = await deviceInfo.parse(cookieHeader);
  return {
    device: deviceData,
  };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const {
    device: { url },
  } = await serverLoader();
  try {
    const evolverClient = createEvolverClient(url);

    const { data } = await Evolver.state({ client: evolverClient });
    const describeEvolver = await Evolver.describe({ client: evolverClient });
    const vials = describeEvolver?.data?.config?.vials;

    return {
      vials: vials,
      evolverState: data,
    };
  } catch (error) {
    throw new Error("Failed to load device state");
  }
}

export default function Hardware() {
  const { id } = useParams();
  const { evolverState } = useLoaderData<typeof clientLoader>();

  const {
    ENV: { EXCLUDED_PROPERTIES },
  } = useRouteLoaderData("root");

  const excludedProperties = EXCLUDED_PROPERTIES?.split(",") ?? [];

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      <FilterableVialGrid
        stateData={evolverState.state}
        id={id}
        vialCount={VIAL_COUNT}
        excludedProperties={excludedProperties}
      />
    </div>
  );
}
