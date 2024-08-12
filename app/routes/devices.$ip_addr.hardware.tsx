import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";

import * as Evolver from "client/services.gen";
import clsx from "clsx";
import { useState } from "react";
import { SensorChart } from "~/components/SensorChart";
import { VialGrid } from "~/components/VialGrid";
import {
  RawSensorData,
  VialProperty,
  getSensorProperty,
} from "~/utils/getSensorProperty";
import { HardwareTable } from "~/components/HardwareTable";
import { loader } from "./devices.$ip_addr";
import { EvolverConfigWithoutDefaults } from "client";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { ip_addr: string; hardware_name: string };
  }) => {
    const { ip_addr, hardware_name } = params;
    return <Link to={`/devices/${ip_addr}/hardware`}>hardware</Link>;
  },
};

export default function Hardware() {
  // TODO: figure this out, should submit to nearest layout route with a loader
  const loaderData = useRouteLoaderData<typeof loader>(
    "routes/devices.$ip_addr",
  );
  let description;

  if (loaderData?.description?.config && loaderData?.schema?.config) {
    description = loaderData.description;
  }

  const evolverConfig = description?.config as EvolverConfigWithoutDefaults;

  return (
    <div>
      <HardwareTable evolverConfig={evolverConfig} />
      <Outlet />
    </div>
  );
}
