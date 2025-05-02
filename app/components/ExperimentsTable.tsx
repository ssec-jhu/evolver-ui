import { Link, useLocation, useParams } from "@remix-run/react";
import { Experiment_Output } from "client";
import clsx from "clsx";

export function ExperimentsTable({
  experiments,
}: {
  experiments: { [key: string]: Experiment_Output };
}) {
  const { name, id } = useParams();
  const { pathname } = useLocation();
  const pathElements = pathname.split("/");
  const currentPath = pathElements[pathElements.length - 1];

  const rows = [];

  Object.entries(experiments).forEach(
    ([experiment_name, { enabled, controllers }], ix) => {
      rows.push(
        <tr key={experiment_name + ix} className={clsx("font-mono")}>
          <td className="font-mono">
            <Link
              className={clsx(
                pathElements.includes(experiment_name) && "underline",
              )}
              to={`/devices/${id}/${name}/experiments/${experiment_name}`}
            >
              {experiment_name}
            </Link>
          </td>
          <td>{enabled ? "enabled" : "disabled"}</td>
          <td>
            <Link
              className={clsx("btn btn-outline join-item")}
              to={`/devices/${id}/${name}/experiments/${experiment_name}/logs#logs`}
            >
              logs
            </Link>
          </td>

          <td className="font-mono">
            <ul className="list">
              {controllers?.map(
                ({ classinfo, config: { name: controllerName } }, ix) => {
                  return (
                    <li
                      className={clsx(
                        "list-row",
                        controllerName === currentPath && "underline",
                      )}
                      key={classinfo + ix}
                    >
                      <div className="opacity-30 font-mono flex items-center">
                        {ix + 1}
                      </div>
                      <div className="list-col-grow flex items-center">
                        {controllerName}
                      </div>

                      <div className="join">
                        <Link
                          className={clsx("btn btn-outline join-item")}
                          to={`/devices/${id}/${name}/experiments/${experiment_name}/${controllerName}/config#${controllerName + "config"}`}
                        >
                          config
                        </Link>
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
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
          <th>logs</th>
          <th>controllers</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
