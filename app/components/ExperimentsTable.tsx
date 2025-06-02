import { Link } from "react-router";
import { ROUTES } from "../utils/routes";
import clsx from "clsx";
import type { Experiment } from "client";

export function ExperimentsTable({
  experiments,
  name,
  id,
  pathname,
}: {
  experiments: { [key: string]: Experiment };
  name: string;
  id: string;
  pathname: string;
}) {
  const pathElements = pathname.split("/").pop();
  const currentPath = pathElements[pathElements.length - 1];

  const rows: JSX.Element[] = [];

  Object.entries(experiments).forEach(
    ([experiment_name, { enabled, controllers }], ix) => {
      rows.push(
        <tr key={experiment_name + ix} className={clsx("font-mono")}>
          <td className="font-mono">
            <Link
              className={clsx(
                pathElements.includes(experiment_name) && "underline",
              )}
              to={ROUTES.device.experiment.current({
                id: id,
                name: name,
                experimentId: experiment_name,
              })}
            >
              {experiment_name}
            </Link>
          </td>
          <td>{enabled ? "enabled" : "disabled"}</td>
          <td>
            <Link
              className={clsx(
                "btn btn-outline join-item font-sans",
                pathname.includes(experiment_name) &&
                  pathname.includes("logs") &&
                  "btn-active",
              )}
              to={`${ROUTES.device.experiment.logs({ id, name, experimentId: experiment_name })}#logs`}
            >
              logs
            </Link>
          </td>

          <td className="font-mono">
            <ul className="list">
              {controllers?.map((controller, ix) => {
                // Check if controller has classinfo and config
                const hasClassinfo = "classinfo" in controller;
                const hasConfig = "config" in controller;
                const hasControllerName =
                  hasConfig && controller.config && "name" in controller.config;

                const classInfo = hasClassinfo
                  ? controller.classinfo
                  : "missing classinfo";

                const controllerName: string = hasControllerName
                  ? (controller.config?.name as string)
                  : "unnamed controller";

                return (
                  <li
                    className={clsx(
                      "list-row",
                      controllerName === currentPath && "underline",
                    )}
                    key={classInfo + ix}
                  >
                    <div className="opacity-30 font-mono flex items-center">
                      {ix + 1}
                    </div>

                    <div
                      className={clsx(
                        "list-col-grow flex items-center font-mono",
                        pathname.includes(controllerName) && "underline",
                      )}
                    >
                      {classInfo.split(".").pop()}
                      {" - "}
                      {controllerName}
                    </div>

                    <div className="join">
                      <Link
                        className={clsx(
                          "btn btn-outline join-item font-sans",
                          pathname.includes(controllerName) && "btn-active",
                        )}
                        to={`${ROUTES.device.experiment.controllers.current.config({ id, name, experimentId: experiment_name, controllerId: controllerName })}#${controllerName + "config"}`}
                      >
                        config
                      </Link>
                    </div>
                  </li>
                );
              })}
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
