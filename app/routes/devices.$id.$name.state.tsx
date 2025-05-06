import { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useParams, useRouteLoaderData } from "react-router";
import * as Evolver from "client/services.gen";
import { FilterableVialGrid } from "~/components/VialGrid";
import { getEvolverClientForDevice } from "~/utils/evolverClient.server";
import { loader as rootLoader } from "~/root";

const VIAL_COUNT = 16;

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return <Link to={`/devices/${id}/${name}/state`}>state</Link>;
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  
  try {
    const { evolverClient } = await getEvolverClientForDevice(id);
    
    const { data } = await Evolver.state({ client: evolverClient });
    const describeEvolver = await Evolver.describe({ client: evolverClient });
    const vials = describeEvolver?.data?.config?.vials;
    
    return {
      vials: vials,
      evolverState: data,
    };
  } catch (error) {
    throw new Error("Failed to load device state: " + (error.message || "Unknown error"));
  }
}

export default function Hardware() {
  const { id } = useParams();
  const { evolverState } = useLoaderData<typeof loader>();

  const {
    ENV: { EXCLUDED_PROPERTIES },
  } = useRouteLoaderData<typeof rootLoader>("root");

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
