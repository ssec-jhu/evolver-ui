import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useParams, useRouteLoaderData, useSearchParams } from "react-router";
import * as Evolver from "client/services.gen";
import { db } from "~/utils/db.server";
import { HardwareLineChart } from "~/components/LineChart";
import { loader as rootLoader } from "~/root";
import { WrenchScrewdriverIcon, XCircleIcon } from "@heroicons/react/24/solid";
import flatMap from "lodash/flatMap";

export const handle = {
  breadcrumb: (
    {
      params,
    }: {
      params: { id: string; hardware_name: string; name: string };
    },
    queryParams?: URLSearchParams,
  ) => {
    const { id, hardware_name, name } = params;
    const linkTo = `/devices/${id}/${name}/hardware/${hardware_name}/history`;
    if (queryParams !== undefined) {
      linkTo.concat(`?${queryParams.toString()}`);
    }
    return <Link to={linkTo}>history</Link>;
  },
};

export function ErrorBoundary() {
  const { hardware_name } = useParams();

  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`Error loading the vial history for hardware: ${hardware_name}`}</h1>
        </div>
      </div>

      <Link to="/devices/list" className="link">
        home
      </Link>
    </div>
  );
}

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

  const results = Promise.allSettled([
    Evolver.history({
      query: {
        name: hardware_name,
      },
      body: {
        vials,
        properties,
        kinds: ["sensor"],
      },
      client: evolverClient,
    }),
    Evolver.history({
      body: {
        kinds: ["event"],
      },
      client: evolverClient,
    }),
  ]).then((results) => {
    return results.map((result) => result.value.data);
  });

  const [hist, events] = await results;

  return { data: hist?.data, events: events?.data };
}

export default function Hardware() {
  const { data, events } = useLoaderData<typeof loader>();
  const {
    ENV: { EXCLUDED_PROPERTIES },
  } = useRouteLoaderData<typeof rootLoader>("root");
  const excludedProperties = EXCLUDED_PROPERTIES?.split(",") ?? [];
  const [searchParams] = useSearchParams();
  const { hardware_name } = useParams();

  if (!data || !hardware_name || !data[hardware_name]) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-base-300 rounded-box relative overflow-x-auto">
        <XCircleIcon className="w-6 h-6" />
        <div>Data not found</div>
      </div>
    );
  }
  const hardwareHistory = data[hardware_name];
  const allHardwareVialsProperties = Object.keys(
    hardwareHistory[0].data,
  ).filter((property) => excludedProperties.includes(property) === false);

  // shape of data is not ideal here, we have a struct mapping event name to
  // array of events. Here we drop name, probably change to backend could keep
  // the name in the struct
  const allEvents = flatMap(events);

  let selectedProperties: string[] = allHardwareVialsProperties;
  let selectedVials: string[] = [];
  if (searchParams.has("vials")) {
    selectedVials = [...new Set(searchParams.get("vials")?.split(",") ?? [])];
  } else {
    Array.from(
      new Set(hardwareHistory.map((entry) => entry.vial?.toString())),
    ).forEach((vial) => {
      if (vial) {
        selectedVials.push(vial);
      }
    });
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
        events={allEvents}
      />
    );
    charts.push(chart);
  });

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      {charts}
    </div>
  );
}
