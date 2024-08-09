import { Link } from "@remix-run/react";
import { EvolverConfigWithoutDefaults } from "client";

export function HardwareTable({
  evolverConfig,
}: {
  evolverConfig: EvolverConfigWithoutDefaults;
}) {
  const evolverHardware = evolverConfig.hardware;

  const TableRows = Object.keys(evolverHardware).map((key, ix) => {
    const { classinfo, config } = evolverHardware[key];
    const { vials, name } = config;
    const vialsString = vials.join(", ");
    return (
      <tr key={key}>
        <td>{key}</td>
        <td>{classinfo}</td>
        <td>{vialsString}</td>
        <td>
          <Link
            to={`../hardware/${key}?classinfo=${classinfo}`}
            className="link tooltip text-primary"
            data-tip="edit hardware config"
          >
            view
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <table className="table table-zebra">
      <thead>
        <tr>
          <th>Name</th>
          <th>Classinfo</th>
          <th>Vials</th>
          <th>History</th>
        </tr>
      </thead>
      <tbody>{TableRows}</tbody>
    </table>
  );
}
