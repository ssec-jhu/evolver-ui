import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import * as Evolver from "client/services.gen";
import { db } from "~/utils/db.server";

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
    const linkTo = `/devices/${id}/hardware/${hardware_name}/`;
    if (queryParams !== undefined) {
      linkTo.concat(`?${queryParams.toString()}`);
    }
    return <Link to={linkTo}>calibrate</Link>;
  },
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { id, hardware_name } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

  const { data } =
    await Evolver.getCalibratorActionsHardwareHardwareNameCalibratorProcedureActionsGet(
      {
        path: {
          hardware_name: hardware_name ?? "",
        },
        client: evolverClient,
      },
    );

  return json({ actions: data?.actions });
}

export default function Hardware() {
  const { actions } = useLoaderData<typeof loader>();
  console.log("GOT SOME actions:!", actions);

  return (
    <div>
      <progress
        className="progress w-full"
        value={0}
        max={actions.length}
      ></progress>
    </div>
  );
  /*
  const { data } = useLoaderData<typeof loader>();
  const {
    ENV: { EXCLUDED_PROPERTIES },
  } = useRouteLoaderData<typeof rootLoader>("root");
  const excludedProperties = EXCLUDED_PROPERTIES?.split(",") ?? [];
  const [searchParams] = useSearchParams();
  const { hardware_name } = useParams();

  if (!data || !hardware_name || !data[hardware_name]) {
    return (
      <div className="flex flex-col items-center justify-center  p-10">
        <XCircleIcon className="w-6 h-6" />
        <div>Data not found</div>
      </div>
    );
  }
  const hardwareHistory = data[hardware_name];
  const allHardwareVials = Object.keys(hardwareHistory[0].data);
  const allHardwareVialsProperties = Object.keys(
    hardwareHistory[0].data[allHardwareVials[0]],
  ).filter((property) => excludedProperties.includes(property) === false);

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
*/
}
