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

  Object.entries(experiments).forEach(([key, { enabled, controllers }], ix) => {
    rows.push(
      <tr key={key + ix} className={clsx("font-mono")}>
        <td className="font-mono">
          <Link
            className={clsx(pathElements.includes(key) && "underline")}
            to={`/devices/${id}/${name}/experiments/${key}`}
          >
            {key}
          </Link>
        </td>
        <td>{enabled ? "enabled" : "disabled"}</td>
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
                    <Link
                      className="list-col-grow flex items-center"
                      to={`/devices/${id}/${name}/experiments/${key}/logs#${controllerName}`}
                    >
                      {controllerName}
                    </Link>

                    <div className="join">
                      <Link
                        className={clsx("btn btn-outline join-item")}
                        to={`/devices/${id}/${name}/experiments/${key}#${controllerName + "config"}`}
                      >
                        config
                      </Link>

                      <Link
                        className={clsx("btn btn-outline join-item")}
                        to={`/devices/${id}/${name}/experiments/${key}/logs#${controllerName}`}
                      >
                        log
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
  });

  return (
    <table className="table">
      <thead>
        <tr>
          <th>name</th>
          <th>state</th>
          <th>controllers</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
