import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";

import * as Evolver from "client/services.gen";
import { useState } from "react";
import { SensorChart } from "~/components/SensorChart";
import {
  RawSensorData,
  VialProperty,
  getSensorProperty,
} from "~/utils/getSensorProperty";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { ip_addr: string; hardware_name: string };
  }) => {
    const { ip_addr, hardware_name } = params;
    return (
      <Link to={`/devices/${ip_addr}/hardware/${hardware_name}/history`}>
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
  const { hardware_name } = useParams();
  const [selectedVial, setSelectedVial] = useState<string[] | null>([]);

  const allVialsRaw = getSensorProperty(
    data as RawSensorData,
    VialProperty.raw,
    selectedVial ?? [],
  );

  return (
    <div className="mt-4">
      <SensorChart data={allVialsRaw} />
    </div>
  );
}
