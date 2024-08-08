import {
  BeakerIcon,
  ChartBarSquareIcon,
  EyeIcon,
  FireIcon,
  PencilSquareIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import { EvolverConfigWithoutDefaults } from "client";

const iconMapper = (name: string) => {
  switch (name) {
    case "ODSensor":
      return <EyeIcon className="h-10 w-10" />;
    case "Temperature":
      return <FireIcon className="h-10 w-10" />;
    default:
      return <WrenchIcon className="h-10 w-10" />;
  }
};

export default function EvolverTree({
  config,
}: {
  config: EvolverConfigWithoutDefaults;
}) {
  const evolverHardware = config.hardware;

  const hardware = Object.keys(evolverHardware).map((key, ix) => {
    const { classinfo, config } = evolverHardware[key];
    const { vials, name } = config;

    return (
      <li key={key + ix}>
        <div className="flex gap-8">
          <div className="text-xl">{key}</div>
          <div className="join flex gap-4">
            <Link
              to={`./hardware/${key}?classinfo=${classinfo}`}
              className="join-item link h-8 w-8 tooltip"
              data-tip="view logs"
            >
              <ChartBarSquareIcon />
            </Link>

            <Link
              to={`./hardware/${key}?classinfo=${classinfo}`}
              className="join-item link h-8 w-8 tooltip"
              data-tip="edit hardware config"
            >
              <PencilSquareIcon />
            </Link>
          </div>
        </div>
      </li>
    );
  });

  return (
    <ul className="menu menu-lg bg-base-200 rounded-lg w-full">
      <li>
        <details open>
          <summary>
            <h1 className="text-xl">Hardware</h1>
          </summary>
          <ul>{hardware}</ul>
        </details>
      </li>
    </ul>
  );
}
