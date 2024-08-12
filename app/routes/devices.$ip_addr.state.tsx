import { createClient } from "@hey-api/client-fetch";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";

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

const stateData = {
  state: {
    od: {
      "0": {
        name: null,
        vial: 0,
        raw: 26634,
        density: null,
      },
      "5": {
        name: null,
        vial: 5,
        raw: 32116,
        density: null,
      },
      "10": {
        name: null,
        vial: 10,
        raw: 42255,
        density: null,
      },
      "15": {
        name: null,
        vial: 15,
        raw: 10533,
        density: null,
      },
    },
    odB: {
      "0": {
        name: null,
        vial: 0,
        raw: 304,
        density: null,
      },
      "5": {
        name: null,
        vial: 5,
        raw: 304,
        density: null,
      },
      "10": {
        name: null,
        vial: 10,
        raw: 41889,
        density: null,
      },
      "15": {
        name: null,
        vial: 15,
        raw: 3051,
        density: null,
      },
    },
    temp: {
      "0": {
        name: null,
        vial: 0,
        raw: 2014,
        temperature: null,
      },
      "5": {
        name: null,
        vial: 5,
        raw: 2003,
        temperature: null,
      },
      "10": {
        name: null,
        vial: 10,
        raw: 2011,
        temperature: null,
      },
      "15": {
        name: null,
        vial: 15,
        raw: 2005,
        temperature: null,
      },
    },
  },
  last_read: {
    od: 1723487343.5802188,
    odB: 1723487344.8322303,
    temp: 1723487346.1722424,
  },
};

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

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { ip_addr, hardware_name } = params;
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  console.log("searchParams", searchParams);

  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${process.env.DEFAULT_DEVICE_PORT}`,
  });
  // TODO GET THE STATE HERE>>>>
  const { data } = await Evolver.getHistory({
    path: { name: hardware_name ?? "" },
    client: evolverClient,
  });

  return json({ data });
}

export default function Hardware() {
  return (
    <div className="mt-8">
      <VialGrid stateData={stateData.state} />
    </div>
  );
}
