import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import * as Evolver from "client/services.gen";
import { SensorChart } from "~/components/SensorChart";
import { RawSensorData, getSensorProperty } from "~/utils/getSensorProperty";
import { ENV } from "~/utils/env.server";

export const handle = {
  breadcrumb: (
    {
      params,
    }: {
      params: { ip_addr: string; hardware_name: string };
    },
    queryParams?: URLSearchParams,
  ) => {
    const { ip_addr, hardware_name } = params;
    const linkTo = `/devices/${ip_addr}/hardware/${hardware_name}/history`;
    if (queryParams !== undefined) {
      linkTo.concat(`?${queryParams.toString()}`);
    }
    return <Link to={linkTo}>{hardware_name}</Link>;
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { ip_addr, hardware_name } = params;

  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${ENV.DEFAULT_DEVICE_PORT}`,
  });

  const { data } = await Evolver.getHistory({
    path: { name: hardware_name ?? "" },
    client: evolverClient,
  });

  return json({ data });
}

export default function Hardware() {
  const { data } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  let selectedVials: string[] = [];

  if (searchParams.has("vials")) {
    selectedVials = [...new Set(searchParams.get("vials")?.split(",") ?? [])];
  }

  let selectedProperties: string[] = [];

  let properties: string[] = [];
  if (searchParams.has("properties")) {
    properties = [...new Set(searchParams.get("properties")?.split(",") ?? [])];
  }

  if (
    properties.length === 0 &&
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].length > 1
  ) {
    // Just take properties for all vials from the first timestamp, assume they are the same for all timestamps
    const readingsAtFirstTimestamp = data[0][1];
    properties = [
      ...new Set(
        Object.values(readingsAtFirstTimestamp).flatMap((vialProperties) =>
          Object.keys(vialProperties),
        ),
      ),
    ];
  }

  selectedProperties = properties.filter(
    (property) => property !== "name" && property !== "vial",
  );

  const charts = selectedProperties.map((property) => {
    const chartData = getSensorProperty(
      data as RawSensorData,
      property,
      selectedVials,
    );
    return (
      <div key={property}>
        <div>{property}</div>
        <SensorChart data={chartData} />
      </div>
    );
  });

  return <div className="mt-4">{charts}</div>;
}
