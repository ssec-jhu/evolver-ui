import {
  WrenchIcon,
  AdjustmentsVerticalIcon,
} from "@heroicons/react/24/outline";

import { useLoaderData } from "@remix-run/react";
import SchemaForm from "./SchemaForm.client";
import { loader } from "~/routes/devices.$id.$name.experiments.$experiment_id.$controller_id.config";

type ControllerConfigProps = {
  controller: {
    classinfo: string;
    config: Record<string, unknown>;
  };
};

export function ControllerConfig({ controller }: ControllerConfigProps) {
  const controllerName = controller.config.name;
  const loaderData = useLoaderData<typeof loader>();
  console.log("Loader data", loaderData);

  console.log("Controller", controller);
  const { classinfo } = controller;
  // dispatch a request to the server to get the json schema for the classinfo

  return (
    <div>
      <SchemaForm
        schema={loaderData.classinfoSchema.config}
        formData={controller.config}
        onSubmit={(data) => console.log("Submitted data", data)}
        title="Configuration Form"
        submitText="Save"
      />
      <div
        id={controllerName + "config"}
        className="card bg-base-100 shadow-xl"
      >
        <ul className="list card-body">
          {Object.entries(controller.config).map(([key, value]) => (
            <li key={key} className="list-row">
              <div>
                <AdjustmentsVerticalIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{key}</div>
                <div className="text-xs font-mono opacity-70">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </div>
              </div>
              <div>
                <WrenchIcon className="h-5 w-5" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
