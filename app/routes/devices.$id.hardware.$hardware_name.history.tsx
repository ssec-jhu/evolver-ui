import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import * as Evolver from "client/services.gen";
import { db } from "~/utils/db.server";
import { HardwareLineChart } from "~/components/LineChart";

export const handle = {
  breadcrumb: (
    {
      params,
    }: {
      params: { id: string; hardware_name: string };
    },
    queryParams?: URLSearchParams,
  ) => {
    const { id, hardware_name } = params;
    const linkTo = `/devices/${id}/hardware/${hardware_name}/history`;
    if (queryParams !== undefined) {
      linkTo.concat(`?${queryParams.toString()}`);
    }
    return <Link to={linkTo}>{hardware_name}</Link>;
  },
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { id, hardware_name } = params;
  const { searchParams } = new URL(request.url);
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

  const vials = searchParams
    .get("vials")
    ?.split(",")
    .map((str) => Number(str));

  const properties = searchParams.get("properties")?.split(",");

  const {
    data: { data },
  } = await Evolver.history({
    body: {
      vials,
      properties,
    },
    query: { name: hardware_name },
    client: evolverClient,
  });

  return json({ data });
}

export default function Hardware() {
  const { data } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { hardware_name } = useParams();
  if (!hardware_name) {
    return <div>Hardware not found</div>;
  }
  const hardwareHistory = data[hardware_name];
  const allHardwareVials = Object.keys(hardwareHistory[0].data);
  const allHardwareVialsProperties = Object.keys(
    hardwareHistory[0].data[allHardwareVials[0]],
  ).filter((property) => property !== "name" && property !== "vial");

  let selectedProperties: string[] = allHardwareVialsProperties;
  let selectedVials: string[] = allHardwareVials;
  if (searchParams.has("vials")) {
    selectedVials = [...new Set(searchParams.get("vials")?.split(",") ?? [])];
  }
  if (searchParams.has("properties")) {
    selectedProperties = [
      ...new Set(searchParams.get("properties")?.split(",") ?? []),
    ];
  }

  const charts = [];
  selectedProperties.forEach((property) => {
    const chart = (
      <HardwareLineChart
        rawData={hardwareHistory}
        vials={selectedVials}
        property={property}
      />
    );
    charts.push(chart);
  });

  return <div className="mt-4">{charts}</div>;
}
