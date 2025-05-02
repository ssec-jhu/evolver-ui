import {
  WrenchIcon,
  AdjustmentsVerticalIcon,
} from "@heroicons/react/24/outline";

import { useLoaderData } from "@remix-run/react";
import SchemaForm from "./SchemaForm";
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

  return (
    <div id={controllerName + "config"}>
      <SchemaForm
        schema={loaderData.classinfoSchema.config}
        formData={controller.config}
        onSubmit={(data) => console.log("Submitted data", data)}
        title="Configuration Form"
        submitText="Save"
      />
    </div>
  );
}
