import { Link } from "@remix-run/react";
import { EvolverConfigWithoutDefaults } from "client";
import clsx from "clsx";

export function HardwareTable({
  evolverConfig,
  id,
  hardwareName,
  queryParams,
}: {
  evolverConfig: EvolverConfigWithoutDefaults;
  id: string;
  hardwareName: string;
  queryParams: URLSearchParams;
}) {
  let currentVials: string[] = [];
  let allVials = false;
  if (queryParams.has("vials")) {
    currentVials = queryParams.get("vials")?.split(",");
  } else {
    allVials = true;
  }
  const evolverHardware = evolverConfig.hardware;

  const TableRows = Object.keys(evolverHardware).map((key) => {
    const {
      config: { vials },
    } = evolverHardware[key];

    const vialsWithLinks = vials.map((vial) => {
      const linkTo = `/devices/${id}/hardware/${key}/history?vials=${vial}`;
      const activeVial =
        currentVials.includes(vial.toString()) && hardwareName === key;
      const vialButtons = (
        <Link
          key={vial}
          className={clsx(
            "btn",
            "btn-xs",
            "btn-outline",
            activeVial && "btn-active",
          )}
          to={linkTo}
        >
          {vial}
        </Link>
      );

      return vialButtons;
    });
    const allButton = (
      <Link
        className={clsx(
          "btn",
          "btn-xs",
          "btn-outline",
          allVials && key === hardwareName && "btn-active",
        )}
        key={"all"}
        to={`/devices/${id}/hardware/${key}/history`}
      >
        {" "}
        all
      </Link>
    );

    return (
      <tr key={key} className={clsx(hardwareName === key && "bg-base-300")}>
        <td>{key}</td>
        <td className="flex gap-2">
          {vialsWithLinks}
          {allButton}
        </td>
      </tr>
    );
  });

  return (
    <table className="table">
      <thead>
        <tr>
          <th>name</th>
          <th>vials</th>
        </tr>
      </thead>
      <tbody>{TableRows}</tbody>
    </table>
  );
}
