import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import * as Evolver from "client/services.gen";
import { VialGrid } from "~/components/VialGrid";
import { ENV } from "~/utils/env.server";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { ip_addr: string; hardware_name: string };
  }) => {
    const { ip_addr } = params;
    return <Link to={`/devices/${ip_addr}/state`}>state</Link>;
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { ip_addr } = params;
  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${ENV.DEFAULT_DEVICE_PORT}`,
  });
  const { data } = await Evolver.getStateStateGet({ client: evolverClient });
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
