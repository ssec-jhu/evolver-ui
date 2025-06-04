import { Link, useLoaderData, useParams, useSearchParams } from "react-router";
import * as Evolver from "client/services.gen";
import { HardwareLineChart } from "~/components/LineChart";
import { WrenchScrewdriverIcon, XCircleIcon } from "@heroicons/react/24/solid";
import flatMap from "lodash/flatMap";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { ROUTES } from "~/utils/routes";
import type { Route } from "./+types/devices.$id.$name.hardware.$hardware_name.history";
import { DefaultHydrateFallback } from "~/components/HydrateFallback";
import { getClientEnv } from "~/utils/env.server";

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
    const baseLinkTo = ROUTES.device.hardware.history({
      id,
      name,
      hardwareName: hardware_name,
    });
    const linkTo =
      queryParams !== undefined
        ? `${baseLinkTo}?${queryParams.toString()}`
        : baseLinkTo;
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

      <Link to={ROUTES.static.devices} className="link">
        home
      </Link>
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  return {
    device: await deviceInfo.parse(request.headers.get("Cookie")),
    ENV: getClientEnv(),
  };
}

export async function clientLoader({
  params,
  request,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const { hardware_name } = params;
  const { searchParams } = new URL(request.url);

  const { device, ENV } = await serverLoader();
  const { url } = device;

  const evolverClient = createEvolverClient(url);

  const vials = searchParams
    .get("vials")
    ?.split(",")
    .map((str) => Number(str));

  const properties = searchParams.get("properties")?.split(",");

  const [sensorHistory, deviceEvents] = await Promise.all([
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
    return results.map((result) => result.data);
  });

  return { data: sensorHistory?.data, events: deviceEvents?.data, ENV };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DefaultHydrateFallback />;
}

export default function Hardware() {
  const { data, events, ENV } = useLoaderData<typeof clientLoader>();
  const excludedProperties = ENV?.EXCLUDED_PROPERTIES?.split(",") ?? [];
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
    hardwareHistory[0]?.data ?? {},
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

  const charts = selectedProperties.map((property) => {
    return (
      <HardwareLineChart
        key={`${hardware_name}-${property}`}
        rawData={hardwareHistory}
        vials={selectedVials}
        property={property}
        events={allEvents}
      />
    );
  });

  return <div className="flex flex-col gap-4">{charts}</div>;
}
