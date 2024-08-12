import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react";

import * as Evolver from "client/services.gen";
import { SensorChart } from "~/components/SensorChart";
import {
  RawSensorData,
  VialProperty,
  getSensorProperty,
} from "~/utils/getSensorProperty";

export const handle = {
  breadcrumb: ({ params }) => {
    const { ip_addr, hardware_name } = params;
    return (
      <Link to={`/devices/${ip_addr}/hardware/${hardware_name}`}>
        {hardware_name}
      </Link>
    );
  },
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { ip_addr, hardware_name } = params;
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  console.log("searchParams", searchParams);

  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${process.env.DEFAULT_DEVICE_PORT}`,
  });

  const { data } = await Evolver.getHistory({
    path: { name: hardware_name ?? "" },
    client: evolverClient,
  });

  return json({ data });
}

export default function Hardware() {
  const { data } = useLoaderData<typeof loader>();
  const allVialsRaw = getSensorProperty(
    data as RawSensorData,
    VialProperty.raw,
  );

  return (
    <div className="mt-8">
      <div>Raw</div>
      <SensorChart data={allVialsRaw} />
    </div>
  );
}
