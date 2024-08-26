import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import * as Evolver from "client/services.gen";
import { VialGrid } from "~/components/VialGrid";
import { db } from "~/utils/db.server";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string } }) => {
    const { id } = params;
    return <Link to={`/devices/${id}/state`}>state</Link>;
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });
  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });
  const { data } = await Evolver.state({ client: evolverClient });
  return json({ evolverState: data });
}

export default function Hardware() {
  const { ip_addr } = useParams();
  const { evolverState } = useLoaderData<typeof loader>();
  return (
    <div>
      <VialGrid stateData={evolverState.state} ip={ip_addr} />
    </div>
  );
}
