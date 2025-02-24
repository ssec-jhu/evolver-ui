import { Link, useLocation, useParams } from "@remix-run/react";
import { Experiment_Output } from "client";
import clsx from "clsx";

export function ExperimentsTable({
  id,
  experiments,
}: {
  id: string;
  experiments: { [key: string]: Experiment_Output };
}) {
  const { pathname } = useLocation();
  const currentPath = pathname.split("/").pop();
  const { experiment_name } = useParams();

  const rows = [];
  Object.entries(experiments).forEach(
    ([key, { name, enabled, controllers }]) => {
      rows.push(
        <tr key={key} className={clsx("font-mono")}>
          <td className="font-mono">{name}</td>
          <td>{enabled ? "enabled" : "disabled"}</td>
          <td className="font-mono">
            <ul className="list">
              {controllers?.map(({ classinfo, config }) => {
                return (
                  <li className="list-row underline" key={classinfo}>
                    <Link
                      to={`/devices/${id}/experiments/${key}/logs#${config.name}`}
                    >
                      {config.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </td>
          <td className="flex justify-end font-sans">
            <Link
              className={clsx(
                "btn btn-outline",
                key === experiment_name &&
                currentPath === "logs" &&
                "btn-active",
              )}
              to={`/devices/${id}/experiments/${key}/logs`}
            >
              logs
            </Link>
          </td>
        </tr>,
      );
    },
  );

  return (
    <table className="table">
      <thead>
        <tr>
          <th>name</th>
          <th>state</th>
          <th>controllers</th>
          <th className="flex justify-end">logs</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
